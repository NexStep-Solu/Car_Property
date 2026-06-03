<?php

namespace App\Http\Controllers;

use App\Models\InventoryStock;
use App\Models\Medicine;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        $orders = PurchaseOrder::with(['supplier', 'user'])
            ->when(request('search'), function ($query) {
                $query->where('order_number', 'like', '%' . request('search') . '%')
                      ->orWhereHas('supplier', function ($q) {
                          $q->where('name', 'like', '%' . request('search') . '%');
                      })
                      ->orWhere('invoice_number', 'like', '%' . request('search') . '%');
            })
            ->when(request('supplier_id'), function ($query) {
                $query->where('supplier_id', request('supplier_id'));
            })
            ->when(request('status'), function ($query) {
                $query->where('status', request('status'));
            })
            ->when(request('date_from'), function ($query) {
                $query->where('order_date', '>=', request('date_from'));
            })
            ->when(request('date_to'), function ($query) {
                $query->where('order_date', '<=', request('date_to'));
            })
            ->orderBy(request('sort_by', 'created_at'), request('sort_order', 'desc'))
            ->paginate(request('per_page', 15));

        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();
        $statuses = PurchaseOrder::getStatuses();

        return inertia('PurchaseOrders/Index', [
            'orders' => $orders,
            'suppliers' => $suppliers,
            'statuses' => $statuses,
            'filters' => request()->only(['search', 'supplier_id', 'status', 'date_from', 'date_to', 'sort_by', 'sort_order', 'per_page']),
        ]);
    }

    public function create()
    {
        $medicines = Medicine::where('is_active', true)->orderBy('name')->get();
        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();

        return inertia('PurchaseOrders/Create', [
            'medicines' => $medicines,
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date|after_or_equal:order_date',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.ordered_quantity' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0|max:100',
            'items.*.discount_rate' => 'nullable|numeric|min:0|max:100',
            'items.*.batch_number' => 'nullable|string|max:100',
            'items.*.expiry_date' => 'nullable|date',
            'items.*.notes' => 'nullable|string',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'internal_notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $order = PurchaseOrder::create([
                'order_number' => PurchaseOrder::generateOrderNumber(),
                'supplier_id' => $validated['supplier_id'],
                'user_id' => auth()->id(),
                'order_date' => $validated['order_date'],
                'expected_delivery_date' => $validated['expected_delivery_date'] ?? null,
                'status' => 'draft',
                'notes' => $validated['notes'] ?? null,
                'internal_notes' => $validated['internal_notes'] ?? null,
            ]);

            $subtotal = 0;

            foreach ($validated['items'] as $item) {
                $lineSubtotal = $item['ordered_quantity'] * $item['unit_cost'];
                $discount = $lineSubtotal * (($item['discount_rate'] ?? 0) / 100);
                $afterDiscount = $lineSubtotal - $discount;
                $tax = $afterDiscount * (($item['tax_rate'] ?? 0) / 100);
                $lineTotal = $afterDiscount + $tax;

                PurchaseOrderItem::create([
                    'purchase_order_id' => $order->id,
                    'medicine_id' => $item['medicine_id'],
                    'batch_number' => $item['batch_number'] ?? null,
                    'expiry_date' => $item['expiry_date'] ?? null,
                    'ordered_quantity' => $item['ordered_quantity'],
                    'received_quantity' => 0,
                    'rejected_quantity' => 0,
                    'unit_cost' => $item['unit_cost'],
                    'tax_rate' => $item['tax_rate'] ?? 0,
                    'discount_rate' => $item['discount_rate'] ?? 0,
                    'line_total' => $lineTotal,
                    'notes' => $item['notes'] ?? null,
                ]);

                $subtotal += $lineTotal;
            }

            $order->update([
                'subtotal' => $subtotal,
                'tax_amount' => $validated['tax_amount'] ?? 0,
                'discount_amount' => $validated['discount_amount'] ?? 0,
                'total_amount' => $subtotal + ($validated['tax_amount'] ?? 0) - ($validated['discount_amount'] ?? 0),
            ]);

            DB::commit();

            return redirect()->route('purchase-orders.index')->with('success', 'Purchase order created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to create purchase order: ' . $e->getMessage())->withInput();
        }
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(['supplier', 'user', 'items.medicine']);

        return inertia('PurchaseOrders/Show', [
            'order' => $purchaseOrder,
        ]);
    }

    public function edit(PurchaseOrder $purchaseOrder)
    {
        if (!in_array($purchaseOrder->status, ['draft', 'pending'])) {
            return redirect()->route('purchase-orders.index')->with('error', 'Cannot edit order in current status.');
        }

        $purchaseOrder->load(['supplier', 'items.medicine']);
        $medicines = Medicine::where('is_active', true)->orderBy('name')->get();
        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();

        return inertia('PurchaseOrders/Edit', [
            'order' => $purchaseOrder,
            'medicines' => $medicines,
            'suppliers' => $suppliers,
        ]);
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        if (!in_array($purchaseOrder->status, ['draft', 'pending'])) {
            return redirect()->route('purchase-orders.index')->with('error', 'Cannot update order in current status.');
        }

        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date|after_or_equal:order_date',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.ordered_quantity' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0|max:100',
            'items.*.discount_rate' => 'nullable|numeric|min:0|max:100',
            'items.*.batch_number' => 'nullable|string|max:100',
            'items.*.expiry_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $purchaseOrder->update([
                'supplier_id' => $validated['supplier_id'],
                'order_date' => $validated['order_date'],
                'expected_delivery_date' => $validated['expected_delivery_date'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            $purchaseOrder->items()->delete();

            $subtotal = 0;

            foreach ($validated['items'] as $item) {
                $lineSubtotal = $item['ordered_quantity'] * $item['unit_cost'];
                $discount = $lineSubtotal * (($item['discount_rate'] ?? 0) / 100);
                $afterDiscount = $lineSubtotal - $discount;
                $tax = $afterDiscount * (($item['tax_rate'] ?? 0) / 100);
                $lineTotal = $afterDiscount + $tax;

                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'medicine_id' => $item['medicine_id'],
                    'batch_number' => $item['batch_number'] ?? null,
                    'expiry_date' => $item['expiry_date'] ?? null,
                    'ordered_quantity' => $item['ordered_quantity'],
                    'received_quantity' => 0,
                    'rejected_quantity' => 0,
                    'unit_cost' => $item['unit_cost'],
                    'tax_rate' => $item['tax_rate'] ?? 0,
                    'discount_rate' => $item['discount_rate'] ?? 0,
                    'line_total' => $lineTotal,
                ]);

                $subtotal += $lineTotal;
            }

            $purchaseOrder->update([
                'subtotal' => $subtotal,
                'total_amount' => $subtotal,
            ]);

            DB::commit();

            return redirect()->route('purchase-orders.index')->with('success', 'Purchase order updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to update purchase order: ' . $e->getMessage())->withInput();
        }
    }

    public function updateStatus(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,pending,approved,ordered,partial_received,received,cancelled',
        ]);

        $currentStatus = $purchaseOrder->status;
        $newStatus = $validated['status'];

        if ($newStatus === 'cancelled' && !in_array($currentStatus, ['draft', 'pending'])) {
            return redirect()->route('purchase-orders.index')->with('error', 'Cannot cancel order in current status.');
        }

        $purchaseOrder->update(['status' => $newStatus]);

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase order status updated successfully.');
    }

    public function receiveStock(Request $request, PurchaseOrder $purchaseOrder)
    {
        if (!in_array($purchaseOrder->status, ['ordered', 'partial_received'])) {
            return redirect()->route('purchase-orders.index')->with('error', 'Order must be in ordered or partial received status.');
        }

        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'items.*.received_quantity' => 'required|integer|min:0',
            'items.*.rejected_quantity' => 'nullable|integer|min:0',
            'invoice_number' => 'nullable|string|max:100',
            'actual_delivery_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            foreach ($validated['items'] as $itemData) {
                $item = PurchaseOrderItem::find($itemData['purchase_order_item_id']);
                $receivedQty = $itemData['received_quantity'];
                $rejectedQty = $itemData['rejected_quantity'] ?? 0;
                
                $totalReceived = $item->received_quantity + $receivedQty;
                
                if ($totalReceived > $item->ordered_quantity) {
                    throw new \Exception("Received quantity exceeds ordered quantity for item: " . $item->medicine->name);
                }

                $item->update([
                    'received_quantity' => $totalReceived,
                    'rejected_quantity' => $item->rejected_quantity + $rejectedQty,
                ]);

                if ($receivedQty > 0) {
                    $stock = InventoryStock::create([
                        'medicine_id' => $item->medicine_id,
                        'supplier_id' => $purchaseOrder->supplier_id,
                        'batch_number' => $item->batch_number ?? InventoryStock::generateBatchNumber(),
                        'expiry_date' => $item->expiry_date,
                        'quantity' => $receivedQty,
                        'unit_cost' => $item->unit_cost,
                        'unit_price' => $item->medicine->selling_price,
                        'received_date' => $validated['actual_delivery_date'] ?? now(),
                        'status' => 'available',
                    ]);

                    StockMovement::create([
                        'medicine_id' => $item->medicine_id,
                        'inventory_stock_id' => $stock->id,
                        'supplier_id' => $purchaseOrder->supplier_id,
                        'user_id' => auth()->id(),
                        'reference_number' => StockMovement::generateReferenceNumber('purchase'),
                        'movement_type' => 'purchase',
                        'quantity' => $receivedQty,
                        'previous_quantity' => $item->medicine->total_stock,
                        'new_quantity' => $item->medicine->total_stock + $receivedQty,
                        'unit_cost' => $item->unit_cost,
                        'total_cost' => $receivedQty * $item->unit_cost,
                        'batch_number' => $item->batch_number,
                        'movement_date' => $validated['actual_delivery_date'] ?? now(),
                        'invoice_number' => $validated['invoice_number'] ?? null,
                        'notes' => 'Received via Purchase Order: ' . $purchaseOrder->order_number,
                    ]);
                }
            }

            $allFullyReceived = $purchaseOrder->items->every(fn($i) => $i->received_quantity >= $i->ordered_quantity);
            $anyPartiallyReceived = $purchaseOrder->items->some(fn($i) => $i->received_quantity > 0 && $i->received_quantity < $i->ordered_quantity);

            $newStatus = $allFullyReceived ? 'received' : ($anyPartiallyReceived ? 'partial_received' : 'ordered');

            $purchaseOrder->update([
                'status' => $newStatus,
                'actual_delivery_date' => $allFullyReceived ? ($validated['actual_delivery_date'] ?? now()) : $purchaseOrder->actual_delivery_date,
                'invoice_number' => $validated['invoice_number'] ?? $purchaseOrder->invoice_number,
            ]);

            DB::commit();

            return redirect()->route('purchase-orders.index')->with('success', 'Stock received successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to receive stock: ' . $e->getMessage());
        }
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        if (!in_array($purchaseOrder->status, ['draft', 'cancelled'])) {
            return redirect()->route('purchase-orders.index')->with('error', 'Cannot delete order in current status.');
        }
        
        $purchaseOrder->items()->delete();
        $purchaseOrder->delete();

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase order deleted successfully.');
    }
}
