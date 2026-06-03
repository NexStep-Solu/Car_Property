<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
       $patients = Patient::orderBy('patient_id', 'desc')->paginate(10);

        return Inertia::render('Patients/Index', [
            'patients' => $patients,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Patients/Create');
    }

    /**
     * Store a newly created patient in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'nullable|in:Male,Female,Other',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'marital_status' => 'nullable|in:Single,Married,Divorced,Widowed',
            'occupation' => 'nullable|string|max:100',
            'nationality' => 'nullable|string|max:50',
            'preferred_language' => 'nullable|string|max:50',
            'registration_date' => 'required|date',
            'emergency_contact_name' => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relation' => 'nullable|string|max:50',
            'profile_photo_url' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'notes' => 'nullable|string',
            'diagnosis' => 'nullable|string',
        ]);


        if ($request->hasFile('profile_photo_url')) {
            $image = $request->file('profile_photo_url');

            $imageName = time() . '_' . $image->getClientOriginalName();

            $image->move(public_path('uploads/patients'), $imageName);

            $validated['profile_photo_url'] = '/uploads/patients/' . $imageName;
        }

        Patient::create($validated);

        return redirect()->route('patients.index')
            ->with('success', 'Patient created successfully.');
    }
    /**
     * Display the specified patient.
     */
    public function show(Patient $patient)
    {
        return Inertia::render('Patients/Show', [
            'patient' => $patient,
        ]);
    }

    /**
     * Show the form for editing the specified patient.
     */
    public function edit(Patient $patient)
    {
        return Inertia::render('Patients/Edit', [
            'patient' => $patient,
        ]);
    }

    /**
     * Update the specified patient in storage.
     */
    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'nullable|in:Male,Female,Other',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'marital_status' => 'nullable|in:Single,Married,Divorced,Widowed',
            'occupation' => 'nullable|string|max:100',
            'nationality' => 'nullable|string|max:50',
            'preferred_language' => 'nullable|string|max:50',
            'registration_date' => 'required|date',
            'emergency_contact_name' => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relation' => 'nullable|string|max:50',
            'profile_photo_url' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'notes' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'is_deceased' => 'nullable|boolean',
            'deceased_date' => 'nullable|date',
        ]);

        // 
        if ($request->hasFile('profile_photo_url')) {

            // delete old image
            if ($patient->profile_photo_url && file_exists(public_path($patient->profile_photo_url))) {
                unlink(public_path($patient->profile_photo_url));
            }

            $image = $request->file('profile_photo_url');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/patients'), $imageName);

            $validated['profile_photo_url'] = '/uploads/patients/' . $imageName;
        }

        $patient->update($validated);

        return redirect()->route('patients.index')
            ->with('success', 'Patient updated successfully.');
    }

    /**
     * Remove the specified patient from storage.
     */
    public function destroy(Patient $patient)
    {
        $patient->delete();

        return redirect()->route('patients.index')->with('success', 'Patient deleted successfully.');
    }
}
