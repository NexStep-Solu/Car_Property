<?php

namespace App\Http\Controllers;

use App\Models\OperationTheater;
use Illuminate\Http\Request;

class OperationTheaterController extends Controller
{
    public function index()
    {
        $theaters = OperationTheater::orderBy('name')->get();
        return inertia('OperationTheaters/Index', ['theaters' => $theaters]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:operation_theatres,code',
            'location' => 'nullable|string|max:100',
            'capacity' => 'nullable|integer|min:1',
            'equipment' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        OperationTheater::create($validated);
        return redirect()->route('operation-theaters.index')->with('success', 'Operation theater created.');
    }

    public function update(Request $request, OperationTheater $operationTheater)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:operation_theatres,code,' . $operationTheater->id,
            'location' => 'nullable|string|max:100',
            'capacity' => 'nullable|integer|min:1',
            'equipment' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $operationTheater->update($validated);
        return redirect()->route('operation-theaters.index')->with('success', 'Operation theater updated.');
    }

    public function destroy(OperationTheater $operationTheater)
    {
        $operationTheater->delete();
        return redirect()->route('operation-theaters.index')->with('success', 'Operation theater deleted.');
    }

    public function toggleAvailability(OperationTheater $operationTheater)
    {
        $operationTheater->update(['is_available' => !$operationTheater->is_available]);
        return redirect()->back()->with('success', 'Availability updated.');
    }
}
