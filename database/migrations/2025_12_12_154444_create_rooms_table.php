<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();

            // Legacy column used by the existing chat feature.
            // In the hospital ERP context, this can be kept in sync with `room_number`.
            $table->string('name')->nullable();

            // Core identifiers
            $table->string('room_number', 20);
            // Keep this column without FK here, because `room_types` migration
            // is timestamped after this migration.
            $table->unsignedBigInteger('room_type_id');

            // Location tracking (floors/buildings tables can be added later)
            $table->unsignedBigInteger('floor_id')->nullable();
            $table->unsignedBigInteger('building_id')->nullable();
            $table->unsignedBigInteger('department_id')->nullable();

            $table->timestamps();

            // Capacity / occupancy
            $table->integer('capacity')->default(1);
            $table->integer('current_occupancy')->default(0);
            $table->integer('square_feet')->nullable();
            $table->text('amenities')->nullable(); // JSON array as text

            // Location details
            $table->string('wing', 50)->nullable();
            $table->string('corridor', 50)->nullable();

            // Status
            $table->enum('status', [
                'Available',
                'Occupied',
                'Maintenance',
                'Reserved',
                'Cleaning',
                'Out-of-Service',
            ])->default('Available');
            $table->enum('cleaning_status', [
                'Clean',
                'Dirty',
                'In-Progress',
                'Sanitized',
            ])->default('Clean');

            // Charges
            $table->decimal('room_charges_per_day', 10, 2)->nullable();
            $table->decimal('nursing_charges_per_day', 10, 2)->nullable();
            $table->decimal('equipment_charges_per_day', 10, 2)->nullable();

            // Metadata
            $table->boolean('is_active')->default(true);
            $table->date('last_maintenance_date')->nullable();
            $table->date('next_maintenance_date')->nullable();
            $table->text('notes')->nullable();

            $table->unique(['room_number', 'building_id'], 'unique_room');
            // Note: foreign keys are added in follow-up migrations to keep
            // correct dependency ordering (room_types, departments, etc).
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
