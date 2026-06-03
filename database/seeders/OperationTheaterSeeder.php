<?php

namespace Database\Seeders;

use App\Models\OperationTheater;
use App\Models\SurgerySchedule;
use App\Models\Patient;
use App\Models\Employee;
use App\Models\IpdRecord;
use Illuminate\Database\Seeder;

class OperationTheaterSeeder extends Seeder
{
    public function run(): void
    {
        $this->createTheaters();
        $this->createSurgerySchedules();
    }

    private function createTheaters(): void
    {
        $theaters = [
            [
                'name' => 'Main Operation Theater 1',
                'code' => 'OT-001',
                'location' => 'Ground Floor, Building A',
                'capacity' => 1,
                'is_available' => true,
                'equipment' => 'Full surgical suite with advanced monitoring equipment, anesthesia machine, cardiac monitor',
            ],
            [
                'name' => 'Main Operation Theater 2',
                'code' => 'OT-002',
                'location' => 'Ground Floor, Building A',
                'capacity' => 1,
                'is_available' => true,
                'equipment' => 'General surgery equipment, laparoscopic set, electrosurgical unit',
            ],
            [
                'name' => 'Emergency Operation Theater',
                'code' => 'OT-EMG',
                'location' => 'Emergency Department, Ground Floor',
                'capacity' => 1,
                'is_available' => true,
                'equipment' => 'Emergency surgical equipment, trauma set, massive transfusion protocol ready',
            ],
            [
                'name' => 'Cardiac Operation Theater',
                'code' => 'OT-CAR',
                'location' => 'First Floor, Cardiac Center',
                'capacity' => 1,
                'is_available' => true,
                'equipment' => 'Cardiac bypass machine, heart-lung machine, specialized cardiac monitoring',
            ],
            [
                'name' => 'Orthopedic Operation Theater',
                'code' => 'OT-ORT',
                'location' => 'Second Floor, Orthopedic Wing',
                'capacity' => 1,
                'is_available' => true,
                'equipment' => 'C-arm fluoroscopy, orthopedic implant sets, fracture fixation equipment',
            ],
            [
                'name' => 'Minor Procedure Room',
                'code' => 'OT-MIN',
                'location' => 'Ground Floor, Day Care Center',
                'capacity' => 2,
                'is_available' => true,
                'equipment' => 'Minor surgery equipment, local anesthesia setup, wound care supplies',
            ],
        ];

        foreach ($theaters as $theater) {
            OperationTheater::firstOrCreate(
                ['code' => $theater['code']],
                $theater
            );
        }

        $this->command->info('Operation theaters seeded successfully!');
    }

    private function createSurgerySchedules(): void
    {
        $patients = Patient::all();
        $theaters = OperationTheater::where('is_available', true)->get();
        $doctors = Employee::where('status', 'active')->with('user')
            ->get()
            ->filter(function ($emp) {
                return $emp->user && $emp->user->hasRole('doctor');
            });

        if ($patients->isEmpty()) {
            $this->command->info('No patients found. Skipping surgery schedules.');
            return;
        }

        $surgeries = [
            ['name' => 'Appendectomy', 'type' => 'major', 'duration' => 60, 'charges' => 25000],
            ['name' => 'Laparoscopic Cholecystectomy', 'type' => 'major', 'duration' => 90, 'charges' => 35000],
            ['name' => 'Hernia Repair (Open)', 'type' => 'major', 'duration' => 75, 'charges' => 20000],
            ['name' => 'Caesarean Section', 'type' => 'major', 'duration' => 60, 'charges' => 40000],
            ['name' => 'Knee Arthroscopy', 'type' => 'minor', 'duration' => 45, 'charges' => 30000],
            ['name' => 'Tonsillectomy', 'type' => 'minor', 'duration' => 45, 'charges' => 15000],
            ['name' => 'Cataract Surgery', 'type' => 'minor', 'duration' => 30, 'charges' => 25000],
            ['name' => 'Fracture Fixation', 'type' => 'major', 'duration' => 120, 'charges' => 45000],
            ['name' => 'Appendectomy (Emergency)', 'type' => 'emergency', 'duration' => 60, 'charges' => 30000],
            ['name' => 'Debridement of Wound', 'type' => 'minor', 'duration' => 30, 'charges' => 10000],
            ['name' => 'Breast Lump Excision', 'type' => 'minor', 'duration' => 45, 'charges' => 18000],
            ['name' => 'Thyroidectomy', 'type' => 'major', 'duration' => 120, 'charges' => 50000],
            ['name' => 'Hydrocele Repair', 'type' => 'minor', 'duration' => 45, 'charges' => 12000],
            ['name' => 'Piles (Hemorrhoidectomy)', 'type' => 'major', 'duration' => 60, 'charges' => 22000],
            ['name' => 'Circumcision', 'type' => 'minor', 'duration' => 30, 'charges' => 8000],
        ];

        $statuses = ['scheduled', 'scheduled', 'scheduled', 'completed', 'completed', 'in_progress'];

        foreach ($patients->take(rand(8, 20)) as $patient) {
            if ($theaters->isEmpty() || $doctors->isEmpty()) {
                break;
            }

            $surgery = $surgeries[array_rand($surgeries)];
            $theater = $theaters->random();
            $surgeon = $doctors->random();
            $anesthetist = $doctors->random();
            $status = $statuses[array_rand($statuses)];
            $scheduledDate = now()->addDays(rand(-5, 30));

            SurgerySchedule::firstOrCreate(
                [
                    'patient_id' => $patient->patient_id,
                    'surgery_number' => SurgerySchedule::generateSurgeryNumber(),
                ],
                [
                    'operation_theater_id' => $theater->id,
                    'surgeon_id' => $surgeon->id,
                    'anesthetist_id' => $anesthetist->id,
                    'surgery_name' => $surgery['name'],
                    'surgery_type' => $surgery['type'],
                    'status' => $status,
                    'scheduled_date' => $scheduledDate,
                    'scheduled_time' => sprintf('%02d:%02d', rand(8, 14), rand(0, 5) * 10),
                    'estimated_duration' => $surgery['duration'],
                    'pre_op_diagnosis' => 'Patient requires ' . strtolower($surgery['name']),
                    'post_op_diagnosis' => $status === 'completed' ? 'Surgery completed successfully' : null,
                    'complications' => null,
                    'notes' => null,
                    'charges' => $surgery['charges'],
                ]
            );
        }

        $this->command->info('Surgery schedules seeded successfully!');
    }
}
