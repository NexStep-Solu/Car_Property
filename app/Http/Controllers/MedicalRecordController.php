<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicalRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = MedicalRecord::with(['patient', 'doctor']);

        if ($request->patient_id) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->record_type) {
            $query->where('record_type', $request->record_type);
        }

        $records = $query->latest()->paginate(10);

        return Inertia::render('MedicalRecords/Index', [
            'records' => $records,
        ]);
    }

    public function create()
    {
        return Inertia::render('MedicalRecords/Create', [
            'patients' => Patient::select('patient_id', 'name')->get(),
            'doctors' => User::role('doctor')->select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,patient_id',
            'doctor_id' => 'nullable|exists:users,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'record_type' => 'required|in:consultation,procedure,follow_up,emergency,surgery',
            'record_date' => 'required|date',
            'chief_complaint' => 'nullable|string',
            'symptoms' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        MedicalRecord::create($validated);

        return redirect()->route('medical-records.index')
            ->with('success', 'Medical record created successfully.');
    }

    public function show(MedicalRecord $medicalRecord)
    {
        $medicalRecord->load(['patient', 'doctor', 'appointment', 'branch']);

        return Inertia::render('MedicalRecords/Show', [
            'record' => $medicalRecord,
        ]);
    }

    public function edit(MedicalRecord $medicalRecord)
    {
        return Inertia::render('MedicalRecords/Edit', [
            'record' => $medicalRecord,
            'patients' => Patient::select('patient_id', 'name')->get(),
            'doctors' => User::role('doctor')->select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, MedicalRecord $medicalRecord)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,patient_id',
            'doctor_id' => 'nullable|exists:users,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'record_type' => 'required|in:consultation,procedure,follow_up,emergency,surgery',
            'record_date' => 'required|date',
            'chief_complaint' => 'nullable|string',
            'symptoms' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $medicalRecord->update($validated);

        return redirect()->route('medical-records.index')
            ->with('success', 'Medical record updated successfully.');
    }

    public function destroy(MedicalRecord $medicalRecord)
    {
        $medicalRecord->delete();

        return redirect()->route('medical-records.index')
            ->with('success', 'Medical record deleted successfully.');
    }
}
