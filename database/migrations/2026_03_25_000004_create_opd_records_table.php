<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opd_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->onDelete('cascade');
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('doctor_id')->nullable()->constrained('employees')->onDelete('set null');
            $table->string('opd_number', 50)->unique();
            $table->date('visit_date');
            $table->time('visit_time');
            $table->enum('visit_type', ['new', 'follow_up', 'emergency', 'review'])->default('new');
            $table->text('chief_complaint')->nullable();
            $table->text('history')->nullable();
            $table->text('examination')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('treatment')->nullable();
            $table->text('advice')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['registered', 'in_progress', 'completed', 'cancelled'])->default('registered');
            $table->decimal('consultation_fee', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opd_records');
    }
};
