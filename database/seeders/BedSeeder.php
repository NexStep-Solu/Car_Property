<?php

namespace Database\Seeders;

use App\Models\Bed;
use App\Models\Room;
use Illuminate\Database\Seeder;

class BedSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = Room::all();

        if ($rooms->isEmpty()) {
            $this->command->info('Please run RoomSeeder first');
            return;
        }

        $bedTypes = ['Standard', 'Electric', 'ICU', 'Pediatric', 'Bariatric', 'Stretcher'];
        $statuses = ['Available', 'Occupied', 'Reserved', 'Maintenance', 'Cleaning'];

        foreach ($rooms as $room) {
            $bedCount = rand(1, min(4, $room->capacity));

            for ($i = 1; $i <= $bedCount; $i++) {
                $bedNumber = $room->room_number . '-B' . str_pad($i, 2, '0', STR_PAD_LEFT);
                $isOccupied = $room->current_occupancy >= $i;
                $status = $isOccupied ? 'Occupied' : $statuses[array_rand($statuses)];

                $bedType = match(true) {
                    str_contains($room->room_number, 'ICU') || str_contains($room->room_number, 'CCU') => 'ICU',
                    str_contains($room->room_number, 'PED') || str_contains($room->room_number, 'NICU') => 'Pediatric',
                    str_contains($room->room_number, 'DLX') => 'Electric',
                    default => $bedTypes[array_rand($bedTypes)],
                };

                Bed::firstOrCreate(
                    ['bed_number' => $bedNumber],
                    [
                        'room_id' => $room->id,
                        'bed_type' => $bedType,
                        'has_ventilator' => in_array($bedType, ['ICU', 'Electric']),
                        'has_monitor' => in_array($bedType, ['ICU', 'CCU', 'Electric']),
                        'has_suction' => in_array($bedType, ['ICU', 'Electric']),
                        'has_oxygen' => true,
                        'status' => $status,
                        'is_isolated' => str_contains($room->room_number, 'ICU'),
                        'is_active' => true,
                        'occupied_since' => $status === 'Occupied' ? now()->subDays(rand(1, 7)) : null,
                    ]
                );
            }
        }
    }
}
