<?php

namespace App\Http\Controllers;

use App\Models\LabTest;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabTestController extends Controller
{
    public function index(Request $request)
    {
        $query = LabTest::with(['patient', 'doctor']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $labTests = $query->latest()->paginate(10);

        return Inertia::render('LabTests/Index', [
            'labTests' => $labTests,
        ]);
    }

    public function create()
    {
        return Inertia::render('LabTests/Create', [
            'patients' => Patient::select('patient_id', 'name')->get(),
            'doctors' => User::role('doctor')->select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,patient_id',
            'doctor_id' => 'nullable|exists:users,id',
            'test_name' => 'required|string|max:255',
            'test_code' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:100',
            'ordered_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        LabTest::create(array_merge($validated, [
            'status' => 'ordered',
        ]));

        return redirect()->route('lab-tests.index')
            ->with('success', 'Lab test ordered successfully.');
    }

    public function show(LabTest $labTest)
    {
        $labTest->load(['patient', 'doctor', 'branch']);

        return Inertia::render('LabTests/Show', [
            'labTest' => $labTest,
        ]);
    }

    public function edit(LabTest $labTest)
    {
        return Inertia::render('LabTests/Edit', [
            'labTest' => $labTest,
            'patients' => Patient::select('patient_id', 'name')->get(),
            'doctors' => User::role('doctor')->select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, LabTest $labTest)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,patient_id',
            'doctor_id' => 'nullable|exists:users,id',
            'test_name' => 'required|string|max:255',
            'test_code' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:100',
            'result' => 'nullable|string',
            'normal_range' => 'nullable|string',
            'unit' => 'nullable|string',
            'status' => 'nullable|in:ordered,processing,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['result']) && $labTest->status === 'ordered') {
            $validated['result_date'] = now();
            $validated['status'] = 'completed';
        }

        $labTest->update($validated);

        return redirect()->route('lab-tests.index')
            ->with('success', 'Lab test updated successfully.');
    }

    public function destroy(LabTest $labTest)
    {
        $labTest->delete();

        return redirect()->route('lab-tests.index')
            ->with('success', 'Lab test deleted successfully.');
    }
}
