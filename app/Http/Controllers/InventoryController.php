<?php

namespace App\Http\Controllers;

use App\Models\InventoryStock;
use App\Models\Medicine;
use App\Models\Supplier;
use App\Models\StockMovement;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        $stocks = InventoryStock::with(['medicine.category', 'supplier'])
            ->when(request('search'), function ($query) {
                $query->whereHas('medicine', function ($q) {
                    $q->where('name', 'like', '%' . request('search') . '%')
                      ->orWhere('medicine_code', 'like', '%' . request('search') . '%');
                })
                ->orWhere('batch_number', 'like', '%' . request('search') . '%');
            })
            ->when(request('medicine_id'), function ($query) {
                $query->where('medicine_id', request('medicine_id'));
            })
            ->when(request('supplier_id'), function ($query) {
                $query->where('supplier_id', request('supplier_id'));
            })
            ->when(request('warehouse'), function ($query) {
                $query->where('warehouse', request('warehouse'));
            })
            ->when(request('status'), function ($query) {
                $query->where('status', request('status'));
            })
            ->when(request('expiring_soon'), function ($query) {
                $query->where('expiry_date', '!=', null)
                      ->where('expiry_date', '<=', now()->addDays(30));
            })
            ->when(request('low_stock'), function ($query) {
                $query->whereColumn('quantity', '<=', 'reserved_quantity');
            })
            ->orderBy(request('sort_by', 'created_at'), request('sort_order', 'desc'))
            ->paginate(request('per_page', 15));

        $medicines = Medicine::where('is_active', true)->orderBy('name')->get();
        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();
        $warehouses = InventoryStock::distinct()->pluck('warehouse')->filter()->values();

        return inertia('Inventory/Index', [
            'stocks' => $stocks,
            'medicines' => $medicines,
            'suppliers' => $suppliers,
            'warehouses' => $warehouses,
            'filters' => request()->only(['search', 'medicine_id', 'supplier_id', 'warehouse', 'status', 'expiring_soon', 'low_stock', 'sort_by', 'sort_order', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'batch_number' => 'nullable|string|max:100',
            'expiry_date' => 'nullable|date',
            'manufacture_date' => 'nullable|date',
            'quantity' => 'required|integer|min:0',
            'unit_cost' => 'nullable|numeric|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'pack_size' => 'nullable|string|max:50',
            'warehouse' => 'nullable|string|max:100',
            'shelf_location' => 'nullable|string|max:100',
            'received_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $validated['batch_number'] = $validated['batch_number'] ?? InventoryStock::generateBatchNumber();
        $validated['received_date'] = $validated['received_date'] ?? now();
        $validated['status'] = 'available';

        $medicine = Medicine::find($validated['medicine_id']);
        $validated['unit_cost'] = $validated['unit_cost'] ?? $medicine->cost_price;
        $validated['unit_price'] = $validated['unit_price'] ?? $medicine->selling_price;

        $stock = InventoryStock::create($validated);

        StockMovement::create([
            'medicine_id' => $validated['medicine_id'],
            'inventory_stock_id' => $stock->id,
            'supplier_id' => $validated['supplier_id'],
            'user_id' => auth()->id(),
            'reference_number' => StockMovement::generateReferenceNumber('purchase'),
            'movement_type' => 'initial_stock',
            'quantity' => $validated['quantity'],
            'previous_quantity' => 0,
            'new_quantity' => $validated['quantity'],
            'unit_cost' => $validated['unit_cost'],
            'total_cost' => $validated['quantity'] * $validated['unit_cost'],
            'batch_number' => $validated['batch_number'],
            'movement_date' => now(),
            'notes' => 'Initial stock entry',
        ]);

        return redirect()->route('inventory.index')->with('success', 'Stock created successfully.');
    }

    public function update(Request $request, InventoryStock $inventory)
    {
        $validated = $request->validate([
            'supplier_id' => 'nullable|exists:suppliers,id',
            'batch_number' => 'nullable|string|max:100',
            'expiry_date' => 'nullable|date',
            'manufacture_date' => 'nullable|date',
            'unit_cost' => 'nullable|numeric|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'pack_size' => 'nullable|string|max:50',
            'warehouse' => 'nullable|string|max:100',
            'shelf_location' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $inventory->update($validated);

        return redirect()->route('inventory.index')->with('success', 'Stock updated successfully.');
    }

    public function destroy(InventoryStock $inventory)
    {
        if ($inventory->stockMovements()->exists()) {
            return redirect()->route('inventory.index')->with('error', 'Cannot delete stock with existing movements.');
        }
        
        $inventory->delete();

        return redirect()->route('inventory.index')->with('success', 'Stock deleted successfully.');
    }

    public function adjustStock(Request $request, InventoryStock $inventory)
    {
        $validated = $request->validate([
            'adjustment_quantity' => 'required|integer',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $previousQuantity = $inventory->quantity;
        $newQuantity = $previousQuantity + $validated['adjustment_quantity'];

        if ($newQuantity < 0) {
            return redirect()->route('inventory.index')->with('error', 'Adjustment would result in negative stock.');
        }

        $inventory->update(['quantity' => $newQuantity]);

        StockMovement::create([
            'medicine_id' => $inventory->medicine_id,
            'inventory_stock_id' => $inventory->id,
            'user_id' => auth()->id(),
            'reference_number' => StockMovement::generateReferenceNumber('adjustment'),
            'movement_type' => 'adjustment',
            'quantity' => abs($validated['adjustment_quantity']),
            'previous_quantity' => $previousQuantity,
            'new_quantity' => $newQuantity,
            'unit_cost' => $inventory->unit_cost,
            'total_cost' => abs($validated['adjustment_quantity']) * $inventory->unit_cost,
            'batch_number' => $inventory->batch_number,
            'movement_date' => now(),
            'reason' => $validated['reason'],
            'notes' => $validated['notes'],
        ]);

        return redirect()->route('inventory.index')->with('success', 'Stock adjusted successfully.');
    }

    public function markDamaged(Request $request, InventoryStock $inventory)
    {
        $validated = $request->validate([
            'damaged_quantity' => 'required|integer|min:1|max:' . $inventory->available_quantity,
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $previousQuantity = $inventory->quantity;
        $newDamagedQuantity = $inventory->damaged_quantity + $validated['damaged_quantity'];
        $newQuantity = $previousQuantity - $validated['damaged_quantity'];

        $inventory->update([
            'quantity' => $newQuantity,
            'damaged_quantity' => $newDamagedQuantity,
        ]);

        StockMovement::create([
            'medicine_id' => $inventory->medicine_id,
            'inventory_stock_id' => $inventory->id,
            'user_id' => auth()->id(),
            'reference_number' => StockMovement::generateReferenceNumber('damaged'),
            'movement_type' => 'damage_write_off',
            'quantity' => $validated['damaged_quantity'],
            'previous_quantity' => $previousQuantity,
            'new_quantity' => $newQuantity,
            'unit_cost' => $inventory->unit_cost,
            'total_cost' => $validated['damaged_quantity'] * $inventory->unit_cost,
            'batch_number' => $inventory->batch_number,
            'movement_date' => now(),
            'reason' => $validated['reason'],
            'notes' => $validated['notes'],
        ]);

        return redirect()->route('inventory.index')->with('success', 'Stock marked as damaged.');
    }
}
