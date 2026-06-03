<?php

namespace App\Http\Controllers;

use App\Models\IpdRecord;
use App\Models\Patient;
use App\Models\Bed;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class IpdRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = IpdRecord::with(['patient', 'bed', 'attendingDoctor']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $records = $query->latest()->paginate(10);

        return Inertia::render('IpdRecords/Index', [
            'records' => $records,
        ]);
    }

    public function create()
    {
        return Inertia::render('IpdRecords/Create', [
            'patients' => Patient::select('patient_id', 'name')->get(),
            'beds' => Bed::where('status', 'Available')->with('room')->get(),
            'doctors' => User::role('doctor')->select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,patient_id',
            'bed_id' => 'required|exists:beds,id',
            'admission_date' => 'required|date',
            'diagnosis' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'attending_doctor_id' => 'nullable|exists:users,id',
            'room_charge' => 'nullable|numeric|min:0',
            'nursing_charge' => 'nullable|numeric|min:0',
            'other_charges' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $bed = Bed::find($validated['bed_id']);
        $totalCharges = ($validated['room_charge'] ?? 0) + ($validated['nursing_charge'] ?? 0) + ($validated['other_charges'] ?? 0);

        DB::transaction(function () use ($validated, $bed, $totalCharges) {
            IpdRecord::create(array_merge($validated, [
                'status' => 'admitted',
                'total_charges' => $totalCharges,
            ]));

            $bed->update(['status' => 'occupied']);
        });

        return redirect()->route('ipd-records.index')
            ->with('success', 'IPD admission created successfully.');
    }

    public function show(IpdRecord $ipdRecord)
    {
        $ipdRecord->load(['patient', 'bed.room', 'attendingDoctor', 'branch']);

        return Inertia::render('IpdRecords/Show', [
            'record' => $ipdRecord,
        ]);
    }

    public function edit(IpdRecord $ipdRecord)
    {
        return Inertia::render('IpdRecords/Edit', [
            'record' => $ipdRecord,
            'patients' => Patient::select('patient_id', 'name')->get(),
            'beds' => Bed::with('room')->get(),
            'doctors' => User::role('doctor')->select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, IpdRecord $ipdRecord)
    {
        $validated = $request->validate([
            'diagnosis' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'attending_doctor_id' => 'nullable|exists:users,id',
            'room_charge' => 'nullable|numeric|min:0',
            'nursing_charge' => 'nullable|numeric|min:0',
            'other_charges' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $totalCharges = ($validated['room_charge'] ?? 0) + ($validated['nursing_charge'] ?? 0) + ($validated['other_charges'] ?? 0);
        $validated['total_charges'] = $totalCharges;

        $ipdRecord->update($validated);

        return redirect()->route('ipd-records.index')
            ->with('success', 'IPD record updated successfully.');
    }

    public function discharge(Request $request, IpdRecord $ipdRecord)
    {
        $validated = $request->validate([
            'discharge_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($ipdRecord, $validated) {
            $ipdRecord->update([
                'discharge_date' => $validated['discharge_date'],
                'status' => 'discharged',
                'notes' => $validated['notes'] ?? $ipdRecord->notes,
            ]);

            $ipdRecord->bed->update(['status' => 'available']);
        });

        return redirect()->route('ipd-records.index')
            ->with('success', 'Patient discharged successfully.');
    }

    public function destroy(IpdRecord $ipdRecord)
    {
        if ($ipdRecord->status === 'admitted') {
            $ipdRecord->bed->update(['status' => 'available']);
        }

        $ipdRecord->delete();

        return redirect()->route('ipd-records.index')
            ->with('success', 'IPD record deleted successfully.');
    }
}
