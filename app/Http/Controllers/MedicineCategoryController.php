<?php

namespace App\Http\Controllers;

use App\Models\MedicineCategory;
use Illuminate\Http\Request;

class MedicineCategoryController extends Controller
{
    public function index()
    {
        $categories = MedicineCategory::when(request('search'), function ($query) {
            $query->where('name', 'like', '%' . request('search') . '%')
                  ->orWhere('code', 'like', '%' . request('search') . '%');
        })
        ->when(request('is_active'), function ($query) {
            $query->where('is_active', request('is_active') === 'true');
        })
        ->orderBy(request('sort_by', 'name'), request('sort_order', 'asc'))
        ->paginate(request('per_page', 15));

        return inertia('MedicineCategories/Index', [
            'categories' => $categories,
            'filters' => request()->only(['search', 'is_active', 'sort_by', 'sort_order', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:medicine_categories,code',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        
        MedicineCategory::create($validated);

        return redirect()->route('medicine-categories.index')->with('success', 'Category created successfully.');
    }

    public function update(Request $request, MedicineCategory $medicineCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:medicine_categories,code,' . $medicineCategory->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $medicineCategory->update($validated);

        return redirect()->route('medicine-categories.index')->with('success', 'Category updated successfully.');
    }

    public function destroy(MedicineCategory $medicineCategory)
    {
        if ($medicineCategory->medicines()->exists()) {
            return redirect()->route('medicine-categories.index')->with('error', 'Cannot delete category with existing medicines.');
        }
        
        $medicineCategory->delete();

        return redirect()->route('medicine-categories.index')->with('success', 'Category deleted successfully.');
    }

    public function toggleStatus(MedicineCategory $medicineCategory)
    {
        $medicineCategory->update(['is_active' => !$medicineCategory->is_active]);

        return redirect()->route('medicine-categories.index')->with('success', 'Category status updated successfully.');
    }
}
