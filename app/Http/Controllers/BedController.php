<?php

namespace App\Http\Controllers;

use App\Models\Bed;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BedController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        
        return inertia('Beds/Index', [
            'beds' => Bed::with(['room.roomType', 'lastCleaner'])
                ->latest()
                ->paginate($perPage)
                ->withQueryString(),
            'rooms' => Room::with('roomType')->orderBy('room_number')->get(),
            'employees' => Employee::orderBy('employee_id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $roomId = $request->input('room_id');

        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'bed_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('beds', 'bed_number')->where(fn($q) => $q->where('room_id', $roomId)),
            ],
            'bed_type' => 'required|string|in:Standard,Electric,ICU,Pediatric,Bariatric,Stretcher',

            'has_ventilator' => 'boolean',
            'has_monitor' => 'boolean',
            'has_suction' => 'boolean',
            'has_oxygen' => 'boolean',

            'status' => 'required|string|in:Available,Occupied,Reserved,Maintenance,Cleaning',
            'is_isolated' => 'boolean',

            'current_patient_id' => 'nullable|integer',
            'current_encounter_id' => 'nullable|integer',
            'occupied_since' => 'nullable|date',
            'expected_vacate_date' => 'nullable|date',

            'is_active' => 'boolean',
            'last_cleaned_date' => 'nullable|date',
            'last_cleaned_by' => 'nullable|exists:employees,id',
            'notes' => 'nullable|string',
        ]);

        Bed::create($validated);

        return redirect()->route('beds.index')->with('success', 'Bed created successfully.');
    }

    public function update(Request $request, Bed $bed)
    {
        $roomId = $request->input('room_id');

        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'bed_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('beds', 'bed_number')
                    ->ignore($bed->id)
                    ->where(fn($q) => $q->where('room_id', $roomId)),
            ],
            'bed_type' => 'required|string|in:Standard,Electric,ICU,Pediatric,Bariatric,Stretcher',

            'has_ventilator' => 'boolean',
            'has_monitor' => 'boolean',
            'has_suction' => 'boolean',
            'has_oxygen' => 'boolean',

            'status' => 'required|string|in:Available,Occupied,Reserved,Maintenance,Cleaning',
            'is_isolated' => 'boolean',

            'current_patient_id' => 'nullable|integer',
            'current_encounter_id' => 'nullable|integer',
            'occupied_since' => 'nullable|date',
            'expected_vacate_date' => 'nullable|date',

            'is_active' => 'boolean',
            'last_cleaned_date' => 'nullable|date',
            'last_cleaned_by' => 'nullable|exists:employees,id',
            'notes' => 'nullable|string',
        ]);

        $bed->update($validated);

        return redirect()->route('beds.index')->with('success', 'Bed updated successfully.');
    }

    public function destroy(Bed $bed)
    {
        $bed->delete();

        return redirect()->route('beds.index')->with('success', 'Bed deleted successfully.');
    }

    public function show(Bed $bed)
    {
        $bed->load(['room.roomType', 'patient', 'lastCleaner']);

        return inertia('Beds/Show', [
            'bed' => $bed,
        ]);
    }

    public function create()
    {
        return inertia('Beds/Create', [
            'rooms' => Room::with('roomType')->orderBy('room_number')->get(),
            'employees' => Employee::orderBy('employee_id')->get(),
        ]);
    }

    public function edit(Bed $bed)
    {
        return inertia('Beds/Edit', [
            'bed' => $bed,
            'rooms' => Room::with('roomType')->orderBy('room_number')->get(),
            'employees' => Employee::orderBy('employee_id')->get(),
        ]);
    }
}

