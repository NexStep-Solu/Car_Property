<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::when(request('search'), function ($query) {
            $query->where('name', 'like', '%' . request('search') . '%')
                  ->orWhere('supplier_code', 'like', '%' . request('search') . '%')
                  ->orWhere('email', 'like', '%' . request('search') . '%')
                  ->orWhere('phone', 'like', '%' . request('search') . '%');
        })
        ->when(request('status'), function ($query) {
            $query->where('is_active', request('status') === 'active');
        })
        ->when(request('rating'), function ($query) {
            $query->where('rating', request('rating'));
        })
        ->orderBy(request('sort_by', 'created_at'), request('sort_order', 'desc'))
        ->paginate(request('per_page', 15));

        return inertia('Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => request()->only(['search', 'status', 'rating', 'sort_by', 'sort_order', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'tax_id' => 'nullable|string|max:50',
            'license_number' => 'nullable|string|max:100',
            'credit_limit' => 'nullable|numeric|min:0',
            'payment_terms_days' => 'nullable|integer|min:1',
            'rating' => 'nullable|in:A,B,C,D',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $validated['supplier_code'] = Supplier::generateCode();
        
        Supplier::create($validated);

        return redirect()->route('suppliers.index')->with('success', 'Supplier created successfully.');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'tax_id' => 'nullable|string|max:50',
            'license_number' => 'nullable|string|max:100',
            'credit_limit' => 'nullable|numeric|min:0',
            'payment_terms_days' => 'nullable|integer|min:1',
            'rating' => 'nullable|in:A,B,C,D',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $supplier->update($validated);

        return redirect()->route('suppliers.index')->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier)
    {
        if ($supplier->purchaseOrders()->exists() || $supplier->inventoryStocks()->exists()) {
            return redirect()->route('suppliers.index')->with('error', 'Cannot delete supplier with existing orders or stock.');
        }
        
        $supplier->delete();

        return redirect()->route('suppliers.index')->with('success', 'Supplier deleted successfully.');
    }

    public function show(Supplier $supplier)
    {
        $supplier->load(['purchaseOrders' => function ($query) {
            $query->latest()->take(10);
        }]);

        return inertia('Suppliers/Show', [
            'supplier' => $supplier,
        ]);
    }

    public function toggleStatus(Supplier $supplier)
    {
        $supplier->update(['is_active' => !$supplier->is_active]);

        return redirect()->route('suppliers.index')->with('success', 'Supplier status updated successfully.');
    }
}
