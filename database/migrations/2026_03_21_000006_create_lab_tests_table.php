<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->onDelete('cascade');
            $table->foreignId('doctor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('test_name');
            $table->string('test_code', 50)->nullable();
            $table->string('category', 100)->nullable();
            $table->date('ordered_date');
            $table->date('result_date')->nullable();
            $table->text('result')->nullable();
            $table->string('normal_range')->nullable();
            $table->string('unit')->nullable();
            $table->enum('status', ['ordered', 'processing', 'completed', 'cancelled','pending'])->default('ordered');
            $table->text('notes')->nullable();
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_tests');
    }
};
