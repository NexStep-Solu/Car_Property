<?php

namespace App\Http\Controllers;

use App\Models\RoomType;
use Illuminate\Http\Request;

class RoomTypeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        
        return inertia('RoomTypes/Index', [
            'roomTypes' => RoomType::withCount('rooms')
                ->latest()
                ->paginate($perPage)
                ->withQueryString(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type_code' => 'required|string|max:20|unique:room_types,type_code',
            'type_name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'base_charges_per_day' => 'nullable|numeric',
            'requires_deposit' => 'boolean',
            'deposit_amount' => 'nullable|numeric',
            'is_active' => 'boolean',
        ]);

        RoomType::create($validated);

        return redirect()->route('room_types.index')->with('success', 'Room type created successfully.');
    }

    public function update(Request $request, RoomType $room_type)
    {
        $validated = $request->validate([
            'type_code' => 'required|string|max:20|unique:room_types,type_code,' . $room_type->id,
            'type_name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'base_charges_per_day' => 'nullable|numeric',
            'requires_deposit' => 'boolean',
            'deposit_amount' => 'nullable|numeric',
            'is_active' => 'boolean',
        ]);

        $room_type->update($validated);

        return redirect()->route('room_types.index')->with('success', 'Room type updated successfully.');
    }

    public function destroy(RoomType $room_type)
    {
        $room_type->delete();

        return redirect()->route('room_types.index')->with('success', 'Room type deleted successfully.');
    }

    public function show(RoomType $room_type)
    {
        $room_type->load('rooms');

        return inertia('RoomTypes/Show', [
            'roomType' => $room_type,
        ]);
    }

    public function create()
    {
        return inertia('RoomTypes/Create');
    }

    public function edit(RoomType $room_type)
    {
        return inertia('RoomTypes/Edit', [
            'roomType' => $room_type,
        ]);
    }
}

