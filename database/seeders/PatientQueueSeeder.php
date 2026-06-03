<?php

namespace Database\Seeders;

use App\Models\PatientQueue;
use App\Models\Patient;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Database\Seeder;

class PatientQueueSeeder extends Seeder
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

        $priorities = ['normal', 'normal', 'normal', 'urgent', 'emergency'];
        $statuses = ['waiting', 'waiting', 'waiting', 'called', 'in_progress'];

        foreach ($patients->take(rand(5, 15)) as $index => $patient) {
            $department = $departments->random();
            $doctor = $employees->random();

            PatientQueue::firstOrCreate(
                [
                    'patient_id' => $patient->patient_id,
                    'department_id' => $department->id,
                    'queue_number' => PatientQueue::generateQueueNumber('Q'),
                ],
                [
                    'employee_id' => $doctor->id,
                    'position' => $index + 1,
                    'status' => $statuses[array_rand($statuses)],
                    'priority' => $priorities[array_rand($priorities)],
                    'notes' => null,
                    'called_at' => null,
                    'started_at' => null,
                    'completed_at' => null,
                ]
            );
        }

        $this->command->info('Patient queues seeded successfully!');
    }
}
