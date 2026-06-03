<?php

namespace App\Http\Controllers;

use App\Models\Vital;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VitalController extends Controller
{
    public function index(Request $request)
    {
        $query = Vital::with('patient');

        if ($request->patient_id) {
            $query->where('patient_id', $request->patient_id);
        }

        $vitals = $query->latest()->paginate(10);

        return Inertia::render('Vitals/Index', [
            'vitals' => $vitals,
        ]);
    }

    public function create()
    {
        return Inertia::render('Vitals/Create', [
            'patients' => Patient::select('patient_id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,patient_id',
            'blood_pressure_systolic' => 'nullable|integer|min:60|max:250',
            'blood_pressure_diastolic' => 'nullable|integer|min:40|max:150',
            'heart_rate' => 'nullable|integer|min:30|max:220',
            'temperature' => 'nullable|numeric|min:35|max:42',
            'respiratory_rate' => 'nullable|integer|min:8|max:40',
            'oxygen_saturation' => 'nullable|integer|min:50|max:100',
            'weight' => 'nullable|numeric|min:1|max:500',
            'height' => 'nullable|numeric|min:30|max:250',
            'blood_glucose' => 'nullable|numeric|min:20|max:500',
            'notes' => 'nullable|string',
        ]);

        $validated['recorded_by'] = $request->user()->id;
        $validated['recorded_at'] = now();

        Vital::create($validated);

        return redirect()->route('vitals.index')
            ->with('success', 'Vital signs recorded successfully.');
    }

    public function show(Vital $vital)
    {
        $vital->load(['patient', 'recordedBy']);

        return Inertia::render('Vitals/Show', [
            'vital' => $vital,
        ]);
    }

    public function edit(Vital $vital)
    {
        return Inertia::render('Vitals/Edit', [
            'vital' => $vital,
            'patients' => Patient::select('patient_id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Vital $vital)
    {
        $validated = $request->validate([
            'blood_pressure_systolic' => 'nullable|integer|min:60|max:250',
            'blood_pressure_diastolic' => 'nullable|integer|min:40|max:150',
            'heart_rate' => 'nullable|integer|min:30|max:220',
            'temperature' => 'nullable|numeric|min:35|max:42',
            'respiratory_rate' => 'nullable|integer|min:8|max:40',
            'oxygen_saturation' => 'nullable|integer|min:50|max:100',
            'weight' => 'nullable|numeric|min:1|max:500',
            'height' => 'nullable|numeric|min:30|max:250',
            'blood_glucose' => 'nullable|numeric|min:20|max:500',
            'notes' => 'nullable|string',
        ]);

        $vital->update($validated);

        return redirect()->route('vitals.index')
            ->with('success', 'Vital signs updated successfully.');
    }

    public function destroy(Vital $vital)
    {
        $vital->delete();

        return redirect()->route('vitals.index')
            ->with('success', 'Vital signs deleted successfully.');
    }
}
