<?php

namespace App\Http\Controllers;

use App\Models\CarMake;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CarMakeController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    public function index()
    {
        return Inertia::render('Catalogue/Index', [
            'makes' => CarMake::with(['carModels' => fn ($q) => $q->orderBy('name')])->orderBy('name')->get(),
            'categories' => \App\Models\CarCategory::orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:car_makes,name',
            'is_active' => 'nullable|boolean',
        ]);

        CarMake::create([
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('catalogue.index')->with('success', 'Make added.');
    }

    public function update(Request $request, CarMake $make)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:car_makes,name,'.$make->id,
            'is_active' => 'required|boolean',
        ]);

        $make->update($validated);

        return redirect()->route('catalogue.index')->with('success', 'Make updated.');
    }

    public function destroy(Request $request, CarMake $make)
    {
        if ($make->carModels()->exists()) {
            return back()->withErrors(['make' => 'Cannot delete a make that has models.']);
        }

        $make->delete();

        return redirect()->route('catalogue.index')->with('success', 'Make deleted.');
    }
}
