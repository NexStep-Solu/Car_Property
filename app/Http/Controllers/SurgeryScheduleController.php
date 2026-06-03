<?php

namespace App\Http\Controllers;

use App\Models\OperationTheater;
use App\Models\SurgerySchedule;
use App\Models\Patient;
use App\Models\Employee;
use App\Models\IpdRecord;
use Illuminate\Http\Request;

class SurgeryScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = SurgerySchedule::with(['patient', 'operationTheater', 'surgeon']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('date') && $request->date) {
            $query->whereDate('scheduled_date', $request->date);
        }

        if ($request->has('theater_id') && $request->theater_id) {
            $query->where('operation_theater_id', $request->theater_id);
        }

        $perPage = $request->get('per_page', 15);
        $schedules = $query->orderBy('scheduled_date', 'desc')
            ->orderBy('scheduled_time')
            ->paginate($perPage)
            ->withQueryString();

        $theaters = OperationTheater::where('is_available', true)->get();
        $patients = Patient::orderBy('name')->get();
        $doctors = Employee::where('status', 'active')->whereHas('department', function($q) {
            $q->where('name', 'like', '%Surgery%')->orWhere('name', 'like', '%Doctor%');
        })->with('user')->get();

        return inertia('SurgerySchedules/Index', [
            'schedules' => $schedules,
            'theaters' => $theaters,
            'patients' => $patients,
            'doctors' => $doctors,
            'filters' => $request->only(['status', 'date', 'theater_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,patient_id',
            'operation_theater_id' => 'nullable|exists:operation_theatres,id',
            'surgeon_id' => 'nullable|exists:employees,id',
            'anesthetist_id' => 'nullable|exists:employees,id',
            'ipd_record_id' => 'nullable|exists:ipd_records,id',
            'surgery_name' => 'required|string|max:200',
            'surgery_type' => 'nullable|in:major,minor,emergency,elective',
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'required',
            'estimated_duration' => 'nullable|integer|min:15',
            'pre_op_diagnosis' => 'nullable|string',
            'notes' => 'nullable|string',
            'charges' => 'nullable|numeric|min:0',
        ]);

        $validated['surgery_number'] = SurgerySchedule::generateSurgeryNumber();
        $validated['status'] = 'scheduled';

        SurgerySchedule::create($validated);

        return redirect()->route('surgery-schedules.index')->with('success', 'Surgery scheduled successfully.');
    }

    public function update(Request $request, SurgerySchedule $surgerySchedule)
    {
        $validated = $request->validate([
            'operation_theater_id' => 'nullable|exists:operation_theatres,id',
            'surgeon_id' => 'nullable|exists:employees,id',
            'anesthetist_id' => 'nullable|exists:employees,id',
            'surgery_name' => 'required|string|max:200',
            'surgery_type' => 'nullable|in:major,minor,emergency,elective',
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'required',
            'estimated_duration' => 'nullable|integer|min:15',
            'pre_op_diagnosis' => 'nullable|string',
            'post_op_diagnosis' => 'nullable|string',
            'complications' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:scheduled,pre_op,in_progress,completed,cancelled,postponed',
            'charges' => 'nullable|numeric|min:0',
        ]);

        $surgerySchedule->update($validated);

        return redirect()->route('surgery-schedules.index')->with('success', 'Surgery schedule updated successfully.');
    }

    public function destroy(SurgerySchedule $surgerySchedule)
    {
        $surgerySchedule->delete();

        return redirect()->route('surgery-schedules.index')->with('success', 'Surgery schedule deleted successfully.');
    }

    public function startSurgery(SurgerySchedule $surgerySchedule)
    {
        $surgerySchedule->update(['status' => 'in_progress']);
        return redirect()->back()->with('success', 'Surgery started.');
    }

    public function completeSurgery(Request $request, SurgerySchedule $surgerySchedule)
    {
        $validated = $request->validate([
            'post_op_diagnosis' => 'nullable|string',
            'complications' => 'nullable|string',
            'actual_duration' => 'nullable|integer',
        ]);

        $validated['status'] = 'completed';
        $surgerySchedule->update($validated);

        return redirect()->back()->with('success', 'Surgery completed.');
    }

    public function cancelSurgery(SurgerySchedule $surgerySchedule)
    {
        $surgerySchedule->update(['status' => 'cancelled']);
        return redirect()->back()->with('success', 'Surgery cancelled.');
    }
}
