<?php

namespace App\Http\Controllers;

use App\Models\OpdRecord;
use App\Models\Patient;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Appointment;
use Illuminate\Http\Request;

class OpdRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = OpdRecord::with(['patient', 'department', 'doctor']);

        if ($request->has('patient_id') && $request->patient_id) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->has('department_id') && $request->department_id) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('date') && $request->date) {
            $query->whereDate('visit_date', $request->date);
        }

        $perPage = $request->get('per_page', 15);
        $records = $query->latest()->paginate($perPage)->withQueryString();

        $departments = Department::orderBy('name')->get();
        $patients = Patient::orderBy('name')->get();
        $employees = Employee::where('status', 'active')->with('user')->get();

        return inertia('OpdRecords/Index', [
            'records' => $records,
            'departments' => $departments,
            'patients' => $patients,
            'employees' => $employees,
            'filters' => $request->only(['patient_id', 'department_id', 'status', 'date']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,patient_id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'department_id' => 'nullable|exists:departments,id',
            'doctor_id' => 'nullable|exists:employees,id',
            'visit_date' => 'required|date',
            'visit_time' => 'required',
            'visit_type' => 'nullable|in:new,follow_up,emergency,review',
            'chief_complaint' => 'nullable|string',
            'history' => 'nullable|string',
            'examination' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'treatment' => 'nullable|string',
            'advice' => 'nullable|string',
            'notes' => 'nullable|string',
            'consultation_fee' => 'nullable|numeric|min:0',
        ]);

        $validated['opd_number'] = OpdRecord::generateOpdNumber();
        $validated['status'] = 'registered';

        OpdRecord::create($validated);

        return redirect()->route('opd-records.index')->with('success', 'OPD record created successfully.');
    }

    public function update(Request $request, OpdRecord $opdRecord)
    {
        $validated = $request->validate([
            'department_id' => 'nullable|exists:departments,id',
            'doctor_id' => 'nullable|exists:employees,id',
            'visit_type' => 'nullable|in:new,follow_up,emergency,review',
            'chief_complaint' => 'nullable|string',
            'history' => 'nullable|string',
            'examination' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'treatment' => 'nullable|string',
            'advice' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:registered,in_progress,completed,cancelled',
            'consultation_fee' => 'nullable|numeric|min:0',
        ]);

        $opdRecord->update($validated);

        return redirect()->route('opd-records.index')->with('success', 'OPD record updated successfully.');
    }

    public function destroy(OpdRecord $opdRecord)
    {
        $opdRecord->delete();

        return redirect()->route('opd-records.index')->with('success', 'OPD record deleted successfully.');
    }

    public function show(OpdRecord $opdRecord)
    {
        $opdRecord->load(['patient', 'department', 'doctor', 'appointment']);

        return inertia('OpdRecords/Show', [
            'record' => $opdRecord,
        ]);
    }
}
