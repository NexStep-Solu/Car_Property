<?php

namespace App\Http\Controllers;

use App\Models\DoctorSchedule;
use App\Models\Employee;
use App\Models\Department;
use Illuminate\Http\Request;

class DoctorScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = DoctorSchedule::with(['employee.user', 'department']);

        if ($request->has('employee_id') && $request->employee_id) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('department_id') && $request->department_id) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->has('day_of_week') && $request->day_of_week) {
            $query->where('day_of_week', $request->day_of_week);
        }

        $perPage = $request->get('per_page', 15);
        $schedules = $query->latest()->paginate($perPage)->withQueryString();

        $employees = Employee::where('status', 'active')->with('user')->get();
        $departments = Department::orderBy('name')->get();

        return inertia('DoctorSchedules/Index', [
            'schedules' => $schedules,
            'employees' => $employees,
            'departments' => $departments,
            'filters' => $request->only(['employee_id', 'department_id', 'day_of_week']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'department_id' => 'required|exists:departments,id',
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'slot_duration' => 'nullable|integer|min:5|max:120',
            'max_patients' => 'nullable|integer|min:1',
            'is_available' => 'boolean',
            'is_emergency_available' => 'boolean',
            'location' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        DoctorSchedule::create($validated);

        return redirect()->route('doctor-schedules.index')->with('success', 'Schedule created successfully.');
    }

    public function update(Request $request, DoctorSchedule $doctorSchedule)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'department_id' => 'required|exists:departments,id',
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'slot_duration' => 'nullable|integer|min:5|max:120',
            'max_patients' => 'nullable|integer|min:1',
            'is_available' => 'boolean',
            'is_emergency_available' => 'boolean',
            'location' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $doctorSchedule->update($validated);

        return redirect()->route('doctor-schedules.index')->with('success', 'Schedule updated successfully.');
    }

    public function destroy(DoctorSchedule $doctorSchedule)
    {
        $doctorSchedule->delete();

        return redirect()->route('doctor-schedules.index')->with('success', 'Schedule deleted successfully.');
    }

    public function toggleStatus(DoctorSchedule $doctorSchedule)
    {
        $doctorSchedule->update(['is_available' => !$doctorSchedule->is_available]);

        return redirect()->back()->with('success', 'Status updated successfully.');
    }

    public function getAvailableSlots(DoctorSchedule $doctorSchedule)
    {
        $date = request()->get('date');
        
        $totalMinutes = $doctorSchedule->start_time->diffInMinutes($doctorSchedule->end_time);
        $totalSlots = floor($totalMinutes / $doctorSchedule->slot_duration);
        
        $bookedCount = 0;
        
        $slots = [];
        for ($i = 0; $i < $totalSlots; $i++) {
            $slotStart = $doctorSchedule->start_time->copy()->addMinutes($i * $doctorSchedule->slot_duration);
            $slotEnd = $slotStart->copy()->addMinutes($doctorSchedule->slot_duration);
            
            $slots[] = [
                'start' => $slotStart->format('H:i'),
                'end' => $slotEnd->format('H:i'),
                'is_booked' => $bookedCount > 0,
            ];
        }

        return response()->json($slots);
    }
}
