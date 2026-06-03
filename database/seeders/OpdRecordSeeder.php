<?php

namespace Database\Seeders;

use App\Models\OpdRecord;
use App\Models\Patient;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Database\Seeder;

class OpdRecordSeeder extends Seeder
{
    public function run(): void
    {
        $patients = Patient::all();
        $departments = Department::all();
        $employees = Employee::where('status', 'active')->with('user')->get();

        if ($patients->isEmpty()) {
            $this->command->info('No patients found. Please run PatientSeeder first.');
            return;
        }

        $complaints = [
            'Headache and dizziness',
            'Chest pain and shortness of breath',
            'Fever and cough',
            'Abdominal pain',
            'Joint pain and swelling',
            'Skin rash and itching',
            'Back pain',
            'Eye irritation',
            'Nausea and vomiting',
            'Fatigue and weakness',
        ];

        $diagnoses = [
            'Acute sinusitis',
            'Viral infection',
            'Musculoskeletal pain',
            'Gastroenteritis',
            'Allergic reaction',
            'Tension headache',
            'Hypertension',
            'Diabetes type 2',
            'Asthma',
            'Migraine',
        ];

        $visitTypes = ['new', 'follow_up', 'review', 'emergency'];

        foreach ($patients->take(rand(10, 25)) as $index => $patient) {
            $department = $departments->random();
            $doctor = $employees->random();
            $visitDate = now()->subDays(rand(0, 30));

            OpdRecord::firstOrCreate(
                [
                    'patient_id' => $patient->patient_id,
                    'opd_number' => OpdRecord::generateOpdNumber(),
                ],
                [
                    'department_id' => $department->id,
                    'doctor_id' => $doctor->id,
                    'visit_date' => $visitDate,
                    'visit_time' => sprintf('%02d:%02d', rand(8, 16), rand(0, 5) * 10),
                    'visit_type' => $visitTypes[array_rand($visitTypes)],
                    'chief_complaint' => $complaints[array_rand($complaints)],
                    'history' => 'Patient reports symptoms for ' . rand(1, 7) . ' days.',
                    'examination' => 'General examination reveals ' . strtolower($complaints[array_rand($complaints)]) . '.',
                    'diagnosis' => $diagnoses[array_rand($diagnoses)],
                    'treatment' => 'Prescribed medication and advised rest.',
                    'advice' => 'Follow up in 1 week if symptoms persist.',
                    'notes' => null,
                    'status' => rand(0, 1) ? 'completed' : 'in_progress',
                    'consultation_fee' => rand(50, 200),
                ]
            );
        }

        $this->command->info('OPD records seeded successfully!');
    }
}
