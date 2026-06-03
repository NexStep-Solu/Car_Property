<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insurances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->onDelete('cascade');
            $table->string('insurance_provider');
            $table->string('policy_number', 100);
            $table->string('group_number', 100)->nullable();
            $table->string('plan_name')->nullable();
            $table->date('coverage_start_date');
            $table->date('coverage_end_date');
            $table->decimal('coverage_percentage', 5, 2)->default(0);
            $table->decimal('max_coverage_amount', 12, 2)->default(0);
            $table->enum('status', ['active', 'expired', 'cancelled'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurances');
    }
};
