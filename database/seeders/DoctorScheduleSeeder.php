<?php

namespace Database\Seeders;

use App\Models\DoctorSchedule;
use App\Models\Employee;
use App\Models\Department;
use Illuminate\Database\Seeder;

class DoctorScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::where('status', 'active')->with('user')->get();
        $departments = Department::all();

        if ($employees->isEmpty()) {
            $this->command->info('No employees found. Please run DatabaseSeeder first.');
            return;
        }

        $doctors = $employees->filter(function ($emp) {
            return $emp->user && $emp->user->hasRole('doctor');
        });

        if ($doctors->isEmpty()) {
            $this->command->info('No doctors found.');
            return;
        }

        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        foreach ($doctors as $doctor) {
            $scheduleDays = $days;
            shuffle($scheduleDays);
            $selectedDays = array_slice($scheduleDays, 0, rand(4, 6));

            foreach ($selectedDays as $day) {
                $startHour = rand(8, 10);
                $endHour = rand(16, 18);

                DoctorSchedule::firstOrCreate([
                    'employee_id' => $doctor->id,
                    'department_id' => $doctor->department_id ?? ($departments->random()->id ?? 1),
                    'day_of_week' => $day,
                    'start_time' => sprintf('%02d:00', $startHour),
                    'end_time' => sprintf('%02d:00', $endHour),
                ], [
                    'slot_duration' => rand(15, 30),
                    'max_patients' => rand(10, 20),
                    'is_available' => true,
                    'is_emergency_available' => rand(0, 1),
                    'location' => 'Room ' . rand(100, 299),
                    'notes' => 'Regular ' . strtolower($day) . ' schedule',
                ]);
            }
        }

        $this->command->info('Doctor schedules seeded successfully!');
    }
}
