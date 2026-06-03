<?php

namespace Database\Seeders;

use App\Models\Insurance;
use App\Models\Patient;
use Illuminate\Database\Seeder;

class InsuranceSeeder extends Seeder
{
    public function run(): void
    {
        $patients = Patient::all();

        if ($patients->isEmpty()) {
            $this->command->info('Please run PatientSeeder first');
            return;
        }

        $providers = [
            'Blue Cross Blue Shield',
            'Aetna',
            'United Healthcare',
            'Cigna',
            'Humana',
            'Kaiser Permanente',
            'Medicare',
            'Medicaid',
        ];

        $plans = [
            'Basic Plan',
            'Standard Plan',
            'Premium Plan',
            'Family Plan',
            'Individual Plan',
            'Senior Plan',
        ];

        $statuses = ['active', 'expired', 'cancelled'];

        foreach ($patients->take(8) as $index => $patient) {
            $startDate = now()->subMonths(rand(1, 12));
            $endDate = (clone $startDate)->addYear();

            Insurance::firstOrCreate(
                ['patient_id' => $patient->patient_id, 'policy_number' => 'POL-' . str_pad($index + 1, 6, '0', STR_PAD_LEFT)],
                [
                    'patient_id' => $patient->patient_id,
                    'insurance_provider' => $providers[array_rand($providers)],
                    'policy_number' => 'POL-' . str_pad($index + 1, 6, '0', STR_PAD_LEFT),
                    'group_number' => 'GRP-' . rand(1000, 9999),
                    'plan_name' => $plans[array_rand($plans)],
                    'coverage_start_date' => $startDate,
                    'coverage_end_date' => $endDate,
                    'coverage_percentage' => rand(70, 100),
                    'max_coverage_amount' => rand(50000, 500000),
                    'status' => $statuses[array_rand($statuses)],
                    'notes' => 'Insurance policy active for ' . $patient->name,
                ]
            );
        }
    }
}
