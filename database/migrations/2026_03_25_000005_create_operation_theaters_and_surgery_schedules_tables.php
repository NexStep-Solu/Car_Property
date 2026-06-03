<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operation_theaters', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 20)->unique();
            $table->string('location', 100)->nullable();
            $table->integer('capacity')->default(1);
            $table->boolean('is_available')->default(true);
            $table->text('equipment')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('surgery_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->onDelete('cascade');
            $table->foreignId('operation_theater_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('surgeon_id')->nullable()->constrained('employees')->onDelete('set null');
            $table->foreignId('anesthetist_id')->nullable()->constrained('employees')->onDelete('set null');
            $table->foreignId('ipd_record_id')->nullable()->constrained()->onDelete('set null');
            $table->string('surgery_number', 50)->unique();
            $table->string('surgery_name', 200);
            $table->enum('surgery_type', ['major', 'minor', 'emergency', 'elective'])->default('elective');
            $table->enum('status', ['scheduled', 'pre_op', 'in_progress', 'completed', 'cancelled', 'postponed'])->default('scheduled');
            $table->date('scheduled_date');
            $table->time('scheduled_time');
            $table->integer('estimated_duration')->default(60);
            $table->integer('actual_duration')->nullable();
            $table->text('pre_op_diagnosis')->nullable();
            $table->text('post_op_diagnosis')->nullable();
            $table->text('complications')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('charges', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surgery_schedules');
        Schema::dropIfExists('operation_theaters');
    }
};
