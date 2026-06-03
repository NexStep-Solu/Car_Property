<?php

namespace App\Http\Controllers;

use App\Models\Insurance;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InsuranceController extends Controller
{
    public function index(Request $request)
    {
        $query = Insurance::with('patient');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $insurances = $query->latest()->paginate(10);

        return Inertia::render('Insurances/Index', [
            'insurances' => $insurances,
        ]);
    }

    public function create()
    {
        return Inertia::render('Insurances/Create', [
            'patients' => Patient::select('patient_id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,patient_id',
            'insurance_provider' => 'required|string|max:255',
            'policy_number' => 'required|string|max:100',
            'group_number' => 'nullable|string|max:100',
            'plan_name' => 'nullable|string|max:255',
            'coverage_start_date' => 'required|date',
            'coverage_end_date' => 'required|date|after:coverage_start_date',
            'coverage_percentage' => 'nullable|numeric|min:0|max:100',
            'max_coverage_amount' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,expired,cancelled',
            'notes' => 'nullable|string',
        ]);

        Insurance::create($validated);

        return redirect()->route('insurances.index')
            ->with('success', 'Insurance created successfully.');
    }

    public function show(Insurance $insurance)
    {
        $insurance->load('patient');

        return Inertia::render('Insurances/Show', [
            'insurance' => $insurance,
        ]);
    }

    public function edit(Insurance $insurance)
    {
        return Inertia::render('Insurances/Edit', [
            'insurance' => $insurance,
            'patients' => Patient::select('patient_id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Insurance $insurance)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,patient_id',
            'insurance_provider' => 'required|string|max:255',
            'policy_number' => 'required|string|max:100',
            'group_number' => 'nullable|string|max:100',
            'plan_name' => 'nullable|string|max:255',
            'coverage_start_date' => 'required|date',
            'coverage_end_date' => 'required|date|after:coverage_start_date',
            'coverage_percentage' => 'nullable|numeric|min:0|max:100',
            'max_coverage_amount' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,expired,cancelled',
            'notes' => 'nullable|string',
        ]);

        $insurance->update($validated);

        return redirect()->route('insurances.index')
            ->with('success', 'Insurance updated successfully.');
    }

    public function destroy(Insurance $insurance)
    {
        $insurance->delete();

        return redirect()->route('insurances.index')
            ->with('success', 'Insurance deleted successfully.');
    }
}
