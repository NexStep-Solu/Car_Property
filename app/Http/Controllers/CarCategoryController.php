<?php

namespace App\Http\Controllers;

use App\Models\CarCategory;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CarCategoryController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:car_categories,name',
            'slug' => 'nullable|string|max:120|unique:car_categories,slug',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        CarCategory::create([
            ...$validated,
            'slug' => filled($validated['slug'] ?? null) ? Str::slug($validated['slug']) : Str::slug($validated['name']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('catalogue.index')->with('success', 'Category added.');
    }

    public function update(Request $request, CarCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:car_categories,name,'.$category->id,
            'slug' => 'nullable|string|max:120|unique:car_categories,slug,'.$category->id,
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        if (filled($validated['slug'] ?? null)) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $category->update($validated);

        return redirect()->route('catalogue.index')->with('success', 'Category updated.');
    }

    public function destroy(Request $request, CarCategory $category)
    {
        if ($category->cars()->exists()) {
            return back()->withErrors(['category' => 'Cannot delete a category that has cars.']);
        }

        $category->delete();

        return redirect()->route('catalogue.index')->with('success', 'Category deleted.');
    }
}
