<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('beds', function (Blueprint $table) {
            $table->id();

            $table->foreignId('room_id')->constrained('rooms')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('bed_number', 20)->notNullable();

            // Bed type
            $table->enum('bed_type', ['Standard', 'Electric', 'ICU', 'Pediatric', 'Bariatric', 'Stretcher'])
                ->default('Standard');

            // Features
            $table->boolean('has_ventilator')->default(false);
            $table->boolean('has_monitor')->default(false);
            $table->boolean('has_suction')->default(false);
            $table->boolean('has_oxygen')->default(false);

            // Status
            $table->enum('status', ['Available', 'Occupied', 'Reserved', 'Maintenance', 'Cleaning'])
                ->default('Available');

            $table->boolean('is_isolated')->default(false);

            // Current patient (left without FK constraints until those tables exist)
            $table->unsignedBigInteger('current_patient_id')->nullable();
            $table->unsignedBigInteger('current_encounter_id')->nullable();

            $table->dateTime('occupied_since')->nullable();
            $table->dateTime('expected_vacate_date')->nullable();

            // Metadata
            $table->boolean('is_active')->default(true);
            $table->dateTime('last_cleaned_date')->nullable();

            // Map "staff" to your existing `employees` table for now
            $table->unsignedBigInteger('last_cleaned_by')->nullable();
            $table->foreign('last_cleaned_by')->references('id')->on('employees')->nullOnDelete();

            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['room_id', 'bed_number'], 'unique_bed');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('beds');
    }
};

