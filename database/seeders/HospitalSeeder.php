<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class HospitalSeeder extends Seeder
{
    /**
     * Run all hospital-related seeders in the correct order.
     */
    public function run(): void
    {
        $this->call([
            // 1. Base Setup
            BranchLocationCurrencySeeder::class,

            // 2. Room Types & Infrastructure
            RoomTypeSeeder::class,
            RoomSeeder::class,
            BedSeeder::class,

            // 3. Pharmacy
            SupplierSeeder::class,
            MedicineCategorySeeder::class,
            MedicineSeeder::class,

            // 4. Patients & Services
            PatientSeeder::class,
            ServiceSeeder::class,
            InsuranceSeeder::class,

            // 5. Hospital Records
            HospitalDataSeeder::class,
        ]);
    }
}
