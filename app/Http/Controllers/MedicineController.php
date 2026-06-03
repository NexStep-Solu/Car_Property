<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\MedicineCategory;
use Illuminate\Http\Request;

class MedicineController extends Controller
{
    public function index()
    {
        $medicines = Medicine::with('category')
            ->when(request('search'), function ($query) {
                $query->where('name', 'like', '%' . request('search') . '%')
                      ->orWhere('medicine_code', 'like', '%' . request('search') . '%')
                      ->orWhere('generic_name', 'like', '%' . request('search') . '%')
                      ->orWhere('brand_name', 'like', '%' . request('search') . '%');
            })
            ->when(request('category_id'), function ($query) {
                $query->where('category_id', request('category_id'));
            })
            ->when(request('is_active'), function ($query) {
                $query->where('is_active', request('is_active') === 'true');
            })
            ->when(request('requires_prescription'), function ($query) {
                $query->where('requires_prescription', true);
            })
            ->when(request('is_controlled'), function ($query) {
                $query->where('is_controlled', true);
            })
            ->orderBy(request('sort_by', 'created_at'), request('sort_order', 'desc'))
            ->paginate(request('per_page', 15));

        $categories = MedicineCategory::where('is_active', true)->orderBy('name')->get();

        return inertia('Medicines/Index', [
            'medicines' => $medicines,
            'categories' => $categories,
            'filters' => request()->only(['search', 'category_id', 'is_active', 'requires_prescription', 'is_controlled', 'sort_by', 'sort_order', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:medicine_categories,id',
            'dosage_form' => 'nullable|string|max:50',
            'strength' => 'nullable|string|max:50',
            'unit' => 'nullable|string|max:50',
            'manufacturer' => 'nullable|string|max:255',
            'country_of_origin' => 'nullable|string|max:100',
            'sku' => 'nullable|string|max:50',
            'barcode' => 'nullable|string|max:100',
            'rack_location' => 'nullable|string|max:100',
            'cost_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'nullable|integer|min:0',
            'minimum_stock' => 'nullable|integer|min:0',
            'maximum_stock' => 'nullable|integer|min:0',
            'requires_prescription' => 'boolean',
            'is_controlled' => 'boolean',
            'is_active' => 'boolean',
            'is_vaccine' => 'boolean',
            'side_effects' => 'nullable|string',
            'contraindications' => 'nullable|string',
            'storage_instructions' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $validated['medicine_code'] = Medicine::generateCode();
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['requires_prescription'] = $validated['requires_prescription'] ?? false;
        $validated['is_controlled'] = $validated['is_controlled'] ?? false;
        $validated['is_vaccine'] = $validated['is_vaccine'] ?? false;
        
        Medicine::create($validated);

        return redirect()->route('medicines.index')->with('success', 'Medicine created successfully.');
    }

    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:medicine_categories,id',
            'dosage_form' => 'nullable|string|max:50',
            'strength' => 'nullable|string|max:50',
            'unit' => 'nullable|string|max:50',
            'manufacturer' => 'nullable|string|max:255',
            'country_of_origin' => 'nullable|string|max:100',
            'sku' => 'nullable|string|max:50',
            'barcode' => 'nullable|string|max:100',
            'rack_location' => 'nullable|string|max:100',
            'cost_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'nullable|integer|min:0',
            'minimum_stock' => 'nullable|integer|min:0',
            'maximum_stock' => 'nullable|integer|min:0',
            'requires_prescription' => 'boolean',
            'is_controlled' => 'boolean',
            'is_active' => 'boolean',
            'is_vaccine' => 'boolean',
            'side_effects' => 'nullable|string',
            'contraindications' => 'nullable|string',
            'storage_instructions' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $medicine->update($validated);

        return redirect()->route('medicines.index')->with('success', 'Medicine updated successfully.');
    }

    public function destroy(Medicine $medicine)
    {
        if ($medicine->inventoryStocks()->exists() || $medicine->stockMovements()->exists()) {
            return redirect()->route('medicines.index')->with('error', 'Cannot delete medicine with existing stock or movements.');
        }
        
        $medicine->delete();

        return redirect()->route('medicines.index')->with('success', 'Medicine deleted successfully.');
    }

    public function show(Medicine $medicine)
    {
        $medicine->load(['category', 'inventoryStocks.supplier']);

        return inertia('Medicines/Show', [
            'medicine' => $medicine,
        ]);
    }

    public function toggleStatus(Medicine $medicine)
    {
        $medicine->update(['is_active' => !$medicine->is_active]);

        return redirect()->route('medicines.index')->with('success', 'Medicine status updated successfully.');
    }
}
