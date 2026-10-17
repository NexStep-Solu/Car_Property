<?php

namespace App\Http\Controllers;

use App\Models\CarMake;
use App\Models\CarModel;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;

class CarModelController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    public function store(Request $request)
    {
        $validated = $request->validate([
            'make_id' => 'required|exists:car_makes,id',
            'name' => 'required|string|max:100|unique:car_models,name,NULL,id,make_id,'.$request->input('make_id'),
            'is_active' => 'nullable|boolean',
        ]);

        CarModel::create([
            'make_id' => $validated['make_id'],
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('catalogue.index')->with('success', 'Model added.');
    }

    public function update(Request $request, CarModel $model)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:car_models,name,'.$model->id.',id,make_id,'.$model->make_id,
            'is_active' => 'required|boolean',
        ]);

        $model->update($validated);

        return redirect()->route('catalogue.index')->with('success', 'Model updated.');
    }

    public function destroy(Request $request, CarModel $model)
    {
        if ($model->cars()->exists()) {
            return back()->withErrors(['model' => 'Cannot delete a model that has cars.']);
        }

        $model->delete();

        return redirect()->route('catalogue.index')->with('success', 'Model deleted.');
    }
}
