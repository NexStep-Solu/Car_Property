<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vitals', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->after('patient_id')->constrained('branches')->nullOnDelete();
        });

        Schema::table('insurances', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->after('patient_id')->constrained('branches')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('vitals', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropColumn('branch_id');
        });

        Schema::table('insurances', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropColumn('branch_id');
        });
    }
};
