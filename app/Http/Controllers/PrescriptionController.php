<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Patient;
use App\Models\User;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PrescriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = Prescription::with(['patient', 'doctor']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $prescriptions = $query->latest()->paginate(10);

        return Inertia::render('Prescriptions/Index', [
            'prescriptions' => $prescriptions,
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('Prescriptions/Create', [
            'patients' => Patient::select('patient_id', 'name')->get(),
            'doctors' => User::role('doctor')->select('id', 'name')->get(),
            'medicines' => Medicine::where('is_active', '1')->get(),
            'appointment_id' => $request->appointment_id,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,patient_id',
            'doctor_id' => 'required|exists:users,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'prescription_date' => 'required|date',
            'diagnosis' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:draft,active,completed,cancelled',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.dosage' => 'required|string|max:100',
            'items.*.frequency' => 'required|string|max:100',
            'items.*.duration' => 'required|string|max:100',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.instructions' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $prescription = Prescription::create([
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $validated['doctor_id'],
                'appointment_id' => $validated['appointment_id'] ?? null,
                'prescription_date' => $validated['prescription_date'],
                'diagnosis' => $validated['diagnosis'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => $validated['status'] ?? 'active',
            ]);

            foreach ($validated['items'] as $item) {
                PrescriptionItem::create([
                    'prescription_id' => $prescription->id,
                    'medicine_id' => $item['medicine_id'],
                    'dosage' => $item['dosage'],
                    'frequency' => $item['frequency'],
                    'duration' => $item['duration'],
                    'quantity' => $item['quantity'],
                    'instructions' => $item['instructions'] ?? null,
                ]);
            }
        });

        return redirect()->route('prescriptions.index')
            ->with('success', 'Prescription created successfully.');
    }

    public function show(Prescription $prescription)
    {
        $prescription->load(['patient', 'doctor', 'appointment', 'items.medicine']);

        return Inertia::render('Prescriptions/Show', [
            'prescription' => $prescription,
        ]);
    }

    public function edit(Prescription $prescription)
    {
        $prescription->load('items');

        return Inertia::render('Prescriptions/Edit', [
            'prescription' => $prescription,
            'patients' => Patient::select('patient_id', 'name')->get(),
            'doctors' => User::role('doctor')->select('id', 'name')->get(),
            'medicines' => Medicine::where('status', 'active')->get(),
        ]);
    }

    public function update(Request $request, Prescription $prescription)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,patient_id',
            'doctor_id' => 'required|exists:users,id',
            'prescription_date' => 'required|date',
            'diagnosis' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:draft,active,completed,cancelled',
            'items' => 'sometimes|array',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.dosage' => 'required|string|max:100',
            'items.*.frequency' => 'required|string|max:100',
            'items.*.duration' => 'required|string|max:100',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.instructions' => 'nullable|string',
        ]);

        DB::transaction(function () use ($prescription, $validated) {
            $prescription->update([
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $validated['doctor_id'],
                'prescription_date' => $validated['prescription_date'],
                'diagnosis' => $validated['diagnosis'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => $validated['status'] ?? $prescription->status,
            ]);

            if (isset($validated['items'])) {
                $prescription->items()->delete();
                foreach ($validated['items'] as $item) {
                    PrescriptionItem::create([
                        'prescription_id' => $prescription->id,
                        'medicine_id' => $item['medicine_id'],
                        'dosage' => $item['dosage'],
                        'frequency' => $item['frequency'],
                        'duration' => $item['duration'],
                        'quantity' => $item['quantity'],
                        'instructions' => $item['instructions'] ?? null,
                    ]);
                }
            }
        });

        return redirect()->route('prescriptions.index')
            ->with('success', 'Prescription updated successfully.');
    }

    public function destroy(Prescription $prescription)
    {
        $prescription->items()->delete();
        $prescription->delete();

        return redirect()->route('prescriptions.index')
            ->with('success', 'Prescription deleted successfully.');
    }
}
