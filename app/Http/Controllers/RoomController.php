<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        
        return inertia('Rooms/Index', [
            'rooms' => Room::with(['roomType', 'department'])
                ->latest()
                ->paginate($perPage)
                ->withQueryString(),
            'roomTypes' => RoomType::where('is_active', true)->orderBy('type_name')->get(),
            'departments' => Department::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_number' => 'required|string|max:20',
            'room_type_id' => 'required|exists:room_types,id',
            'floor_id' => 'nullable|integer',
            'building_id' => 'nullable|integer',
            'department_id' => 'nullable|exists:departments,id',

            'capacity' => 'nullable|integer|min:1',
            'current_occupancy' => 'nullable|integer|min:0',
            'square_feet' => 'nullable|integer|min:0',
            'amenities' => 'nullable|string',

            'wing' => 'nullable|string|max:50',
            'corridor' => 'nullable|string|max:50',

            'status' => 'required|string|in:Available,Occupied,Maintenance,Reserved,Cleaning,Out-of-Service',
            'cleaning_status' => 'required|string|in:Clean,Dirty,In-Progress,Sanitized',

            'room_charges_per_day' => 'nullable|numeric',
            'nursing_charges_per_day' => 'nullable|numeric',
            'equipment_charges_per_day' => 'nullable|numeric',

            'is_active' => 'boolean',
            'last_maintenance_date' => 'nullable|date',
            'next_maintenance_date' => 'nullable|date',
            'notes' => 'nullable|string',

            // Legacy/optional column for chat
            'name' => 'nullable|string|max:255',
        ]);

        // Keep the existing `rooms.name` column populated for the chat feature.
        $validated['name'] = !empty(trim((string) ($validated['name'] ?? ''))) ? $validated['name'] : $validated['room_number'];

        Room::create($validated);

        return redirect()->route('rooms.index')->with('success', 'Room created successfully.');
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'room_number' => 'required|string|max:20',
            'room_type_id' => 'required|exists:room_types,id',
            'floor_id' => 'nullable|integer',
            'building_id' => 'nullable|integer',
            'department_id' => 'nullable|exists:departments,id',

            'capacity' => 'nullable|integer|min:1',
            'current_occupancy' => 'nullable|integer|min:0',
            'square_feet' => 'nullable|integer|min:0',
            'amenities' => 'nullable|string',

            'wing' => 'nullable|string|max:50',
            'corridor' => 'nullable|string|max:50',

            'status' => 'required|string|in:Available,Occupied,Maintenance,Reserved,Cleaning,Out-of-Service',
            'cleaning_status' => 'required|string|in:Clean,Dirty,In-Progress,Sanitized',

            'room_charges_per_day' => 'nullable|numeric',
            'nursing_charges_per_day' => 'nullable|numeric',
            'equipment_charges_per_day' => 'nullable|numeric',

            'is_active' => 'boolean',
            'last_maintenance_date' => 'nullable|date',
            'next_maintenance_date' => 'nullable|date',
            'notes' => 'nullable|string',

            // Legacy/optional column for chat
            'name' => 'nullable|string|max:255',
        ]);

        // Keep the existing `rooms.name` column populated for the chat feature.
        $validated['name'] = !empty(trim((string) ($validated['name'] ?? ''))) ? $validated['name'] : $validated['room_number'];

        $room->update($validated);

        return redirect()->route('rooms.index')->with('success', 'Room updated successfully.');
    }

    public function destroy(Room $room)
    {
        $room->delete();

        return redirect()->route('rooms.index')->with('success', 'Room deleted successfully.');
    }

    public function show(Room $room)
    {
        $room->load(['roomType', 'department', 'beds']);

        return inertia('Rooms/Show', [
            'room' => $room,
        ]);
    }

    public function create()
    {
        return inertia('Rooms/Create', [
            'roomTypes' => RoomType::where('is_active', true)->orderBy('type_name')->get(),
            'departments' => Department::orderBy('name')->get(),
        ]);
    }

    public function edit(Room $room)
    {
        return inertia('Rooms/Edit', [
            'room' => $room,
            'roomTypes' => RoomType::where('is_active', true)->orderBy('type_name')->get(),
            'departments' => Department::orderBy('name')->get(),
        ]);
    }
}

