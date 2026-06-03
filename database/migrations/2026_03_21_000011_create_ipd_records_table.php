<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ipd_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->onDelete('cascade');
            $table->foreignId('bed_id')->constrained()->onDelete('cascade');
            $table->dateTime('admission_date');
            $table->dateTime('discharge_date')->nullable();
            $table->string('admission_reason');
            $table->text('diagnosis')->nullable();
            $table->text('treatment_plan')->nullable();
            $table->foreignId('attending_doctor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['admitted', 'discharged'])->default('admitted');
            $table->decimal('room_charge', 10, 2)->default(0);
            $table->decimal('nursing_charge', 10, 2)->default(0);
            $table->decimal('other_charges', 10, 2)->default(0);
            $table->decimal('total_charges', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ipd_records');
    }
};
