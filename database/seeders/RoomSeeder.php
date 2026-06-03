<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\RoomType;
use App\Models\Department;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $roomTypes = RoomType::where('is_active', true)->get();
        $departments = Department::all();

        if ($roomTypes->isEmpty() || $departments->isEmpty()) {
            $this->command->info('Please run RoomTypeSeeder first');
            return;
        }

        $rooms = [
            // ICU Rooms
            ['room_number' => 'ICU-101', 'room_type_id' => $roomTypes->where('type_code', 'ICU')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 1, 'capacity' => 1, 'current_occupancy' => 1, 'status' => 'Occupied', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 500, 'nursing_charges_per_day' => 150, 'equipment_charges_per_day' => 100],
            ['room_number' => 'ICU-102', 'room_type_id' => $roomTypes->where('type_code', 'ICU')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 1, 'capacity' => 1, 'current_occupancy' => 0, 'status' => 'Available', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 500, 'nursing_charges_per_day' => 150, 'equipment_charges_per_day' => 100],
            ['room_number' => 'ICU-103', 'room_type_id' => $roomTypes->where('type_code', 'ICU')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 1, 'capacity' => 1, 'current_occupancy' => 0, 'status' => 'Maintenance', 'cleaning_status' => 'In-Progress', 'room_charges_per_day' => 500, 'nursing_charges_per_day' => 150, 'equipment_charges_per_day' => 100],

            // CCU Rooms
            ['room_number' => 'CCU-201', 'room_type_id' => $roomTypes->where('type_code', 'CCU')->first()?->id, 'department_id' => $departments->where('name', 'Cardiology')->first()?->id, 'floor_id' => 2, 'capacity' => 1, 'current_occupancy' => 1, 'status' => 'Occupied', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 550, 'nursing_charges_per_day' => 160, 'equipment_charges_per_day' => 120],
            ['room_number' => 'CCU-202', 'room_type_id' => $roomTypes->where('type_code', 'CCU')->first()?->id, 'department_id' => $departments->where('name', 'Cardiology')->first()?->id, 'floor_id' => 2, 'capacity' => 1, 'current_occupancy' => 0, 'status' => 'Available', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 550, 'nursing_charges_per_day' => 160, 'equipment_charges_per_day' => 120],

            // Private Rooms
            ['room_number' => 'PRV-301', 'room_type_id' => $roomTypes->where('type_code', 'PRIVATE')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 3, 'capacity' => 1, 'current_occupancy' => 1, 'status' => 'Occupied', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 200, 'nursing_charges_per_day' => 50, 'equipment_charges_per_day' => 20],
            ['room_number' => 'PRV-302', 'room_type_id' => $roomTypes->where('type_code', 'PRIVATE')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 3, 'capacity' => 1, 'current_occupancy' => 0, 'status' => 'Available', 'cleaning_status' => 'Dirty', 'room_charges_per_day' => 200, 'nursing_charges_per_day' => 50, 'equipment_charges_per_day' => 20],
            ['room_number' => 'PRV-303', 'room_type_id' => $roomTypes->where('type_code', 'PRIVATE')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 3, 'capacity' => 1, 'current_occupancy' => 0, 'status' => 'Available', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 200, 'nursing_charges_per_day' => 50, 'equipment_charges_per_day' => 20],
            ['room_number' => 'PRV-304', 'room_type_id' => $roomTypes->where('type_code', 'PRIVATE')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 3, 'capacity' => 1, 'current_occupancy' => 0, 'status' => 'Reserved', 'cleaning_status' => 'Sanitized', 'room_charges_per_day' => 200, 'nursing_charges_per_day' => 50, 'equipment_charges_per_day' => 20],

            // Semi-Private Rooms
            ['room_number' => 'SEMI-401', 'room_type_id' => $roomTypes->where('type_code', 'SEMI-PRIVATE')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 4, 'capacity' => 2, 'current_occupancy' => 1, 'status' => 'Occupied', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 150, 'nursing_charges_per_day' => 40, 'equipment_charges_per_day' => 15],
            ['room_number' => 'SEMI-402', 'room_type_id' => $roomTypes->where('type_code', 'SEMI-PRIVATE')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 4, 'capacity' => 2, 'current_occupancy' => 2, 'status' => 'Occupied', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 150, 'nursing_charges_per_day' => 40, 'equipment_charges_per_day' => 15],
            ['room_number' => 'SEMI-403', 'room_type_id' => $roomTypes->where('type_code', 'SEMI-PRIVATE')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 4, 'capacity' => 2, 'current_occupancy' => 0, 'status' => 'Available', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 150, 'nursing_charges_per_day' => 40, 'equipment_charges_per_day' => 15],

            // Ward Rooms
            ['room_number' => 'WARD-501', 'room_type_id' => $roomTypes->where('type_code', 'WARD')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 5, 'capacity' => 6, 'current_occupancy' => 4, 'status' => 'Occupied', 'cleaning_status' => 'Dirty', 'room_charges_per_day' => 75, 'nursing_charges_per_day' => 25, 'equipment_charges_per_day' => 10],
            ['room_number' => 'WARD-502', 'room_type_id' => $roomTypes->where('type_code', 'WARD')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 5, 'capacity' => 6, 'current_occupancy' => 3, 'status' => 'Occupied', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 75, 'nursing_charges_per_day' => 25, 'equipment_charges_per_day' => 10],
            ['room_number' => 'WARD-503', 'room_type_id' => $roomTypes->where('type_code', 'WARD')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 5, 'capacity' => 6, 'current_occupancy' => 0, 'status' => 'Available', 'cleaning_status' => 'Sanitized', 'room_charges_per_day' => 75, 'nursing_charges_per_day' => 25, 'equipment_charges_per_day' => 10],

            // Pediatric Rooms
            ['room_number' => 'PED-601', 'room_type_id' => $roomTypes->where('type_code', 'PEDIATRIC')->first()?->id, 'department_id' => $departments->where('name', 'Pediatrics')->first()?->id, 'floor_id' => 6, 'capacity' => 1, 'current_occupancy' => 1, 'status' => 'Occupied', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 180, 'nursing_charges_per_day' => 60, 'equipment_charges_per_day' => 30],
            ['room_number' => 'PED-602', 'room_type_id' => $roomTypes->where('type_code', 'PEDIATRIC')->first()?->id, 'department_id' => $departments->where('name', 'Pediatrics')->first()?->id, 'floor_id' => 6, 'capacity' => 1, 'current_occupancy' => 0, 'status' => 'Available', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 180, 'nursing_charges_per_day' => 60, 'equipment_charges_per_day' => 30],

            // NICU
            ['room_number' => 'NICU-701', 'room_type_id' => $roomTypes->where('type_code', 'NICU')->first()?->id, 'department_id' => $departments->where('name', 'Pediatrics')->first()?->id, 'floor_id' => 7, 'capacity' => 4, 'current_occupancy' => 2, 'status' => 'Occupied', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 600, 'nursing_charges_per_day' => 200, 'equipment_charges_per_day' => 150],
            ['room_number' => 'NICU-702', 'room_type_id' => $roomTypes->where('type_code', 'NICU')->first()?->id, 'department_id' => $departments->where('name', 'Pediatrics')->first()?->id, 'floor_id' => 7, 'capacity' => 4, 'current_occupancy' => 0, 'status' => 'Available', 'cleaning_status' => 'Sanitized', 'room_charges_per_day' => 600, 'nursing_charges_per_day' => 200, 'equipment_charges_per_day' => 150],

            // Deluxe Suites
            ['room_number' => 'DLX-801', 'room_type_id' => $roomTypes->where('type_code', 'DELUXE')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 8, 'capacity' => 1, 'current_occupancy' => 1, 'status' => 'Occupied', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 400, 'nursing_charges_per_day' => 80, 'equipment_charges_per_day' => 40],
            ['room_number' => 'DLX-802', 'room_type_id' => $roomTypes->where('type_code', 'DELUXE')->first()?->id, 'department_id' => $departments->where('name', 'General Medicine')->first()?->id, 'floor_id' => 8, 'capacity' => 1, 'current_occupancy' => 0, 'status' => 'Available', 'cleaning_status' => 'Clean', 'room_charges_per_day' => 400, 'nursing_charges_per_day' => 80, 'equipment_charges_per_day' => 40],
        ];

        foreach ($rooms as $room) {
            Room::firstOrCreate(
                ['room_number' => $room['room_number']],
                [
                    'name' => $room['room_number'],
                    'room_type_id' => $room['room_type_id'],
                    'department_id' => $room['department_id'],
                    'floor_id' => $room['floor_id'],
                    'capacity' => $room['capacity'],
                    'current_occupancy' => $room['current_occupancy'],
                    'status' => $room['status'],
                    'cleaning_status' => $room['cleaning_status'],
                    'room_charges_per_day' => $room['room_charges_per_day'],
                    'nursing_charges_per_day' => $room['nursing_charges_per_day'],
                    'equipment_charges_per_day' => $room['equipment_charges_per_day'],
                    'is_active' => true,
                ]
            );
        }
    }
}
