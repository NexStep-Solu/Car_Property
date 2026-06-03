<?php

namespace Database\Seeders;

use App\Models\RoomType;
use Illuminate\Database\Seeder;

class RoomTypeSeeder extends Seeder
{
    public function run(): void
    {
        $roomTypes = [
            [
                'type_code' => 'ICU',
                'type_name' => 'Intensive Care Unit',
                'description' => 'Critical care unit for severely ill patients',
                'base_charges_per_day' => 500.00,
                'requires_deposit' => true,
                'deposit_amount' => 5000.00,
                'is_active' => true,
            ],
            [
                'type_code' => 'PRIVATE',
                'type_name' => 'Private Room',
                'description' => 'Single occupancy room with attached bathroom',
                'base_charges_per_day' => 200.00,
                'requires_deposit' => true,
                'deposit_amount' => 2000.00,
                'is_active' => true,
            ],
            [
                'type_code' => 'SEMI-PRIVATE',
                'type_name' => 'Semi-Private Room',
                'description' => 'Shared room with partition for privacy',
                'base_charges_per_day' => 150.00,
                'requires_deposit' => true,
                'deposit_amount' => 1500.00,
                'is_active' => true,
            ],
            [
                'type_code' => 'WARD',
                'type_name' => 'General Ward',
                'description' => 'Shared ward with multiple beds',
                'base_charges_per_day' => 75.00,
                'requires_deposit' => false,
                'deposit_amount' => 500.00,
                'is_active' => true,
            ],
            [
                'type_code' => 'PEDIATRIC',
                'type_name' => 'Pediatric Room',
                'description' => 'Specially designed room for children',
                'base_charges_per_day' => 180.00,
                'requires_deposit' => true,
                'deposit_amount' => 1800.00,
                'is_active' => true,
            ],
            [
                'type_code' => 'DELUXE',
                'type_name' => 'Deluxe Suite',
                'description' => 'Premium room with all amenities',
                'base_charges_per_day' => 400.00,
                'requires_deposit' => true,
                'deposit_amount' => 4000.00,
                'is_active' => true,
            ],
            [
                'type_code' => 'NICU',
                'type_name' => 'Neonatal ICU',
                'description' => 'Specialized care for newborns',
                'base_charges_per_day' => 600.00,
                'requires_deposit' => true,
                'deposit_amount' => 6000.00,
                'is_active' => true,
            ],
            [
                'type_code' => 'CCU',
                'type_name' => 'Cardiac Care Unit',
                'description' => 'Specialized cardiac monitoring',
                'base_charges_per_day' => 550.00,
                'requires_deposit' => true,
                'deposit_amount' => 5500.00,
                'is_active' => true,
            ],
        ];

        foreach ($roomTypes as $roomType) {
            RoomType::firstOrCreate(
                ['type_code' => $roomType['type_code']],
                $roomType
            );
        }
    }
}
