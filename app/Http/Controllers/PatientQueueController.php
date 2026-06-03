<?php

namespace App\Http\Controllers;

use App\Models\PatientQueue;
use App\Models\Patient;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Appointment;
use Illuminate\Http\Request;

class PatientQueueController extends Controller
{
    public function index(Request $request)
    {
        $query = PatientQueue::with(['patient', 'department', 'employee', 'appointment']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        } else {
            $query->whereIn('status', ['waiting', 'called', 'in_progress']);
        }

        if ($request->has('department_id') && $request->department_id) {
            $query->where('department_id', $request->department_id);
        }

        $perPage = $request->get('per_page', 20);
        $queues = $query->orderBy('priority', 'desc')
            ->orderBy('position')
            ->paginate($perPage)
            ->withQueryString();

        $departments = Department::orderBy('name')->get();
        $patients = Patient::orderBy('name')->get();
        $employees = Employee::where('status', 'active')->with('user')->get();

        return inertia('PatientQueues/Index', [
            'queues' => $queues,
            'departments' => $departments,
            'patients' => $patients,
            'employees' => $employees,
            'filters' => $request->only(['status', 'department_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,patient_id',
            'department_id' => 'nullable|exists:departments,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'employee_id' => 'nullable|exists:employees,id',
            'priority' => 'nullable|in:normal,urgent,emergency',
            'notes' => 'nullable|string',
        ]);

        $lastPosition = PatientQueue::whereDate('created_at', today())
            ->where('status', 'waiting')
            ->max('position') ?? 0;

        $validated['queue_number'] = PatientQueue::generateQueueNumber();
        $validated['position'] = $lastPosition + 1;
        $validated['status'] = 'waiting';

        PatientQueue::create($validated);

        return redirect()->route('patient-queues.index')->with('success', 'Patient added to queue.');
    }

    public function callPatient(PatientQueue $patientQueue)
    {
        $patientQueue->update([
            'status' => 'called',
            'called_at' => now(),
        ]);

        return redirect()->back()->with('success', "Patient {$patientQueue->queue_number} has been called.");
    }

    public function startConsultation(PatientQueue $patientQueue)
    {
        $patientQueue->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Consultation started.');
    }

    public function completeConsultation(PatientQueue $patientQueue)
    {
        $patientQueue->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Consultation completed.');
    }

    public function markNoShow(PatientQueue $patientQueue)
    {
        $patientQueue->update(['status' => 'no_show']);

        return redirect()->back()->with('success', 'Patient marked as no-show.');
    }

    public function cancelQueue(PatientQueue $patientQueue)
    {
        $patientQueue->update(['status' => 'cancelled']);

        return redirect()->back()->with('success', 'Queue entry cancelled.');
    }

    public function getWaitingCount(Request $request)
    {
        $query = PatientQueue::where('status', 'waiting');
        
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        return response()->json(['count' => $query->count()]);
    }

    public function getNextInQueue(Request $request)
    {
        $query = PatientQueue::with(['patient', 'department'])
            ->where('status', 'waiting')
            ->orderBy('priority', 'desc')
            ->orderBy('position');

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        return response()->json($query->first());
    }
}
