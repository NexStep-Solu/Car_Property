<?php

namespace App\Http\Controllers;

use App\Models\InventoryStock;
use App\Models\Medicine;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockMovementController extends Controller
{
    public function index()
    {
        $movements = StockMovement::with(['medicine', 'supplier', 'user'])
            ->when(request('search'), function ($query) {
                $query->where('reference_number', 'like', '%' . request('search') . '%')
                      ->orWhereHas('medicine', function ($q) {
                          $q->where('name', 'like', '%' . request('search') . '%');
                      })
                      ->orWhere('invoice_number', 'like', '%' . request('search') . '%')
                      ->orWhere('challan_number', 'like', '%' . request('search') . '%');
            })
            ->when(request('medicine_id'), function ($query) {
                $query->where('medicine_id', request('medicine_id'));
            })
            ->when(request('supplier_id'), function ($query) {
                $query->where('supplier_id', request('supplier_id'));
            })
            ->when(request('movement_type'), function ($query) {
                $query->where('movement_type', request('movement_type'));
            })
            ->when(request('date_from'), function ($query) {
                $query->where('movement_date', '>=', request('date_from'));
            })
            ->when(request('date_to'), function ($query) {
                $query->where('movement_date', '<=', request('date_to'));
            })
            ->orderBy(request('sort_by', 'movement_date'), request('sort_order', 'desc'))
            ->paginate(request('per_page', 15));

        $medicines = Medicine::where('is_active', true)->orderBy('name')->get();
        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();
        $movementTypes = StockMovement::getMovementTypes();

        return inertia('StockMovements/Index', [
            'movements' => $movements,
            'medicines' => $medicines,
            'suppliers' => $suppliers,
            'movementTypes' => $movementTypes,
            'filters' => request()->only(['search', 'medicine_id', 'supplier_id', 'movement_type', 'date_from', 'date_to', 'sort_by', 'sort_order', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'inventory_stock_id' => 'nullable|exists:inventory_stocks,id',
            'movement_type' => 'required|in:' . implode(',', array_keys(StockMovement::getMovementTypes())),
            'quantity' => 'required|integer|min:1',
            'unit_cost' => 'nullable|numeric|min:0',
            'batch_number' => 'nullable|string|max:100',
            'movement_date' => 'required|date',
            'invoice_number' => 'nullable|string|max:100',
            'challan_number' => 'nullable|string|max:100',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $medicine = Medicine::find($validated['medicine_id']);
        $previousQuantity = $medicine->total_stock;
        
        $validated['user_id'] = auth()->id();
        $validated['reference_number'] = StockMovement::generateReferenceNumber($validated['movement_type']);
        $validated['unit_cost'] = $validated['unit_cost'] ?? $medicine->cost_price;
        $validated['total_cost'] = $validated['quantity'] * $validated['unit_cost'];

        $movementType = $validated['movement_type'];
        $isIncoming = in_array($movementType, ['purchase', 'purchase_return', 'sale_return', 'initial_stock']);
        $quantity = $isIncoming ? abs($validated['quantity']) : -abs($validated['quantity']);
        $newQuantity = $previousQuantity + $quantity;

        $validated['previous_quantity'] = $previousQuantity;
        $validated['new_quantity'] = max(0, $newQuantity);

        $stock = InventoryStock::create([
            'medicine_id' => $validated['medicine_id'],
            'supplier_id' => $validated['supplier_id'] ?? null,
            'batch_number' => $validated['batch_number'] ?? InventoryStock::generateBatchNumber(),
            'quantity' => $isIncoming ? $validated['quantity'] : 0,
            'unit_cost' => $validated['unit_cost'],
            'unit_price' => $medicine->selling_price,
            'received_date' => $validated['movement_date'],
            'status' => 'available',
        ]);

        $validated['inventory_stock_id'] = $stock->id;

        StockMovement::create($validated);

        return redirect()->route('stock-movements.index')->with('success', 'Stock movement recorded successfully.');
    }

    public function show(StockMovement $stockMovement)
    {
        $stockMovement->load(['medicine.category', 'supplier', 'user', 'inventoryStock']);

        return inertia('StockMovements/Show', [
            'movement' => $stockMovement,
        ]);
    }

    public function getLowStockMedicines()
    {
        $medicines = Medicine::with('category')
            ->where('is_active', true)
            ->get()
            ->filter(function ($medicine) {
                return $medicine->total_stock <= $medicine->reorder_level;
            })
            ->map(function ($medicine) {
                return [
                    'id' => $medicine->id,
                    'medicine_code' => $medicine->medicine_code,
                    'name' => $medicine->name,
                    'category' => $medicine->category?->name,
                    'total_stock' => $medicine->total_stock,
                    'reorder_level' => $medicine->reorder_level,
                    'cost_price' => $medicine->cost_price,
                    'selling_price' => $medicine->selling_price,
                ];
            });

        return response()->json($medicines->values());
    }

    public function getExpiringStock()
    {
        $stocks = InventoryStock::with(['medicine.category', 'supplier'])
            ->where('status', 'available')
            ->where('expiry_date', '!=', null)
            ->where('expiry_date', '<=', now()->addDays(90))
            ->orderBy('expiry_date')
            ->get()
            ->map(function ($stock) {
                return [
                    'id' => $stock->id,
                    'medicine' => [
                        'id' => $stock->medicine->id,
                        'name' => $stock->medicine->name,
                        'code' => $stock->medicine->medicine_code,
                    ],
                    'batch_number' => $stock->batch_number,
                    'quantity' => $stock->quantity,
                    'expiry_date' => $stock->expiry_date->format('Y-m-d'),
                    'days_to_expiry' => $stock->days_to_expiry,
                    'supplier' => $stock->supplier?->name,
                ];
            });

        return response()->json($stocks);
    }

    public function getInventorySummary()
    {
        $totalMedicines = Medicine::where('is_active', true)->count();
        $totalStockValue = InventoryStock::where('status', 'available')->sum(\DB::raw('quantity * unit_cost'));
        $totalStockUnits = InventoryStock::where('status', 'available')->sum('quantity');
        
        $lowStockCount = Medicine::where('is_active', true)
            ->get()
            ->filter(fn($m) => $m->total_stock <= $m->reorder_level)
            ->count();

        $expiringCount = InventoryStock::where('status', 'available')
            ->where('expiry_date', '!=', null)
            ->where('expiry_date', '<=', now()->addDays(30))
            ->count();

        $expiredCount = InventoryStock::where('status', 'expired')->count();
        $damagedCount = InventoryStock::where('status', 'damaged')->sum('damaged_quantity');

        return response()->json([
            'total_medicines' => $totalMedicines,
            'total_stock_value' => $totalStockValue,
            'total_stock_units' => $totalStockUnits,
            'low_stock_count' => $lowStockCount,
            'expiring_soon_count' => $expiringCount,
            'expired_count' => $expiredCount,
            'damaged_count' => $damagedCount,
        ]);
    }
}
