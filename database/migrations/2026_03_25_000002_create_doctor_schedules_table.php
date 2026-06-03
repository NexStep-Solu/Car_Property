<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->string('day_of_week', 10);
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('slot_duration')->default(15);
            $table->integer('max_patients')->nullable();
            $table->boolean('is_available')->default(true);
            $table->boolean('is_emergency_available')->default(false);
            $table->string('location', 100)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_schedules');
    }
};
