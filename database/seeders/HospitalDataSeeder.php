<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Vital;
use App\Models\LabTest;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Billing;
use App\Models\BillingItem;
use App\Models\MedicalRecord;
use App\Models\IpdRecord;
use App\Models\Patient;
use App\Models\User;
use App\Models\Medicine;
use App\Models\Service;
use App\Models\Bed;
use Illuminate\Database\Seeder;

class HospitalDataSeeder extends Seeder
{
    public function run(): void
    {
        $patients = Patient::all();
        $doctors = User::role('doctor')->get();
        $employees = \App\Models\Employee::all();
        $medicines = Medicine::all();
        $services = Service::all();
        $beds = Bed::where('status', 'Available')->get();

        if ($patients->isEmpty()) {
            $this->command->info('Please run PatientSeeder first');
            return;
        }

        if ($doctors->isEmpty()) {
            $this->command->info('No doctors found. Please run DatabaseSeeder first');
            return;
        }

        // Create Appointments
        foreach ($patients->take(8) as $index => $patient) {
            $doctor = $doctors->random();
            $date = now()->addDays(rand(-10, 10));
            
            Appointment::firstOrCreate(
                [
                    'patient_id' => $patient->patient_id,
                    'doctor_id' => $doctor->id,
                    'appointment_date' => $date->format('Y-m-d'),
                ],
                [
                    'patient_id' => $patient->patient_id,
                    'doctor_id' => $doctor->id,
                    'department_id' => $doctor->employee?->department_id,
                    'appointment_date' => $date->format('Y-m-d'),
                    'appointment_time' => $date->format('H:i'),
                    'status' => $index < 5 ? 'completed' : ['scheduled', 'confirmed'][array_rand(['scheduled', 'confirmed'])],
                    'type' => ['checkup', 'followup', 'emergency', 'consultation'][array_rand(['checkup', 'followup', 'emergency', 'consultation'])],
                    'reason' => 'Regular ' . ['checkup', 'follow-up visit', 'consultation'][array_rand(['checkup', 'follow-up visit', 'consultation'])],
                    'notes' => $patient->notes,
                ]
            );
        }

        // Create Vitals for patients
        foreach ($patients->take(6) as $patient) {
            Vital::create([
                'patient_id' => $patient->patient_id,
                'recorded_by' => $doctors->random()->id,
                'recorded_at' => now()->subDays(rand(0, 7)),
                'blood_pressure_systolic' => rand(110, 140),
                'blood_pressure_diastolic' => rand(70, 90),
                'heart_rate' => rand(60, 100),
                'temperature' => rand(360, 380) / 10,
                'respiratory_rate' => rand(12, 20),
                'oxygen_saturation' => rand(95, 100),
                'weight' => rand(50, 90) + (rand(0, 9) / 10),
                'height' => rand(160, 185),
                'blood_glucose' => rand(80, 140),
            ]);
        }

        // Create Lab Tests
        $labCategories = ['Hematology', 'Biochemistry', 'Microbiology', 'Pathology'];
        foreach ($patients->take(5) as $index => $patient) {
            $doctor = $doctors->random();
            $orderedDate = now()->subDays(rand(1, 14));
            
            LabTest::create([
                'patient_id' => $patient->patient_id,
                'doctor_id' => $doctor->id,
                'test_name' => ['Complete Blood Count', 'Lipid Profile', 'Thyroid Panel', 'Liver Function Test', 'Kidney Function Test'][array_rand(['Complete Blood Count', 'Lipid Profile', 'Thyroid Panel', 'Liver Function Test', 'Kidney Function Test'])],
                'test_code' => 'TEST-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'category' => $labCategories[array_rand($labCategories)],
                'ordered_date' => $orderedDate,
                'result_date' => $orderedDate->addDays(rand(1, 3)),
                'result' => 'Normal',
                'normal_range' => 'Within normal limits',
                'unit' => 'N/A',
                'status' => $index < 3 ? 'completed' : 'pending',
            ]);
        }

        // Create Prescriptions
        foreach ($patients->take(5) as $index => $patient) {
            $doctor = $doctors->random();
            $appointment = Appointment::where('patient_id', $patient->patient_id)->first();
            
            $prescription = Prescription::create([
                'patient_id' => $patient->patient_id,
                'doctor_id' => $doctor->id,
                'appointment_id' => $appointment?->id,
                'prescription_date' => now()->subDays(rand(0, 7)),
                'diagnosis' => $patient->diagnosis,
                'notes' => 'Please follow dosage instructions carefully',
                'status' => 'active',
            ]);

            // Add 2-4 medicines to each prescription
            $selectedMeds = $medicines->random(rand(2, 4));
            foreach ($selectedMeds as $med) {
                PrescriptionItem::create([
                    'prescription_id' => $prescription->id,
                    'medicine_id' => $med->id,
                    'dosage' => $med->strength,
                    'frequency' => ['1-0-1', '1-1-1', '0-0-1', '1-0-0', '0-1-0'][array_rand(['1-0-1', '1-1-1', '0-0-1', '1-0-0', '0-1-0'])],
                    'duration' => rand(3, 14) . ' days',
                    'quantity' => rand(10, 60),
                    'instructions' => 'Take with food',
                ]);
            }
        }

        // Create Medical Records
        foreach ($patients->take(5) as $patient) {
            $doctor = $doctors->random();
            $appointment = Appointment::where('patient_id', $patient->patient_id)->first();
            
            MedicalRecord::create([
                'patient_id' => $patient->patient_id,
                'doctor_id' => $doctor->id,
                'appointment_id' => $appointment?->id,
                'record_type' => ['consultation', 'followup', 'emergency', 'checkup'][array_rand(['consultation', 'followup', 'emergency', 'checkup'])],
                'record_date' => now()->subDays(rand(0, 14)),
                'chief_complaint' => 'Patient presents with ' . strtolower($patient->diagnosis ?? 'general symptoms'),
                'symptoms' => 'As per patient history',
                'diagnosis' => $patient->diagnosis,
                'treatment_plan' => 'Prescribed appropriate medication and advised follow-up',
                'notes' => 'Patient responding well to treatment',
            ]);
        }

        // Create Billings
        foreach ($patients->take(6) as $index => $patient) {
            $billingDate = now()->subDays(rand(0, 15));
            
            $billing = Billing::create([
                'patient_id' => $patient->patient_id,
                'invoice_number' => 'INV-' . date('Ymd') . '-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'billing_date' => $billingDate,
                'due_date' => $billingDate->addDays(30),
                'subtotal' => rand(100, 500) + (rand(0, 99) / 100),
                'tax' => rand(5, 50),
                'discount' => rand(0, 20),
                'total' => 0,
                'amount_paid' => 0,
                'status' => ['pending', 'partial', 'paid', 'overdue'][array_rand(['pending', 'partial', 'paid', 'overdue'])],
                'payment_method' => ['cash', 'card', 'insurance', 'bank_transfer'][array_rand(['cash', 'card', 'insurance', 'bank_transfer'])],
            ]);

            $billing->total = $billing->subtotal + $billing->tax - $billing->discount;
            $billing->amount_paid = $billing->status === 'paid' ? $billing->total : ($billing->status === 'partial' ? $billing->total * 0.5 : 0);
            $billing->save();

            // Add billing items
            $selectedServices = $services->random(rand(2, 4));
            foreach ($selectedServices as $service) {
                BillingItem::create([
                    'billing_id' => $billing->id,
                    'service_id' => $service->id,
                    'description' => $service->name,
                    'quantity' => 1,
                    'unit_price' => $service->price,
                    'total' => $service->price,
                ]);
            }
        }

        // Create IPD Records for some patients
        foreach ($patients->take(3) as $index => $patient) {
            $doctor = $doctors->random();
            $bed = $beds->random();
            $admissionDate = now()->subDays(rand(1, 7));
            
            IpdRecord::create([
                'patient_id' => $patient->patient_id,
                'bed_id' => $bed->id,
                'admission_date' => $admissionDate,
                'admission_reason' => 'Scheduled admission for ' . ($patient->diagnosis ?? 'treatment'),
                'diagnosis' => $patient->diagnosis,
                'treatment_plan' => 'In-patient treatment with daily monitoring',
                'attending_doctor_id' => $doctor->id,
                'status' => 'admitted',
                'room_charge' => 200.00,
                'nursing_charge' => 50.00,
                'other_charges' => rand(50, 200),
                'total_charges' => 0,
                'notes' => 'Patient stable, daily vitals monitoring required',
            ]);
        }
    }
}
