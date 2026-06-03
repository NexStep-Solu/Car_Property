<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table) {
            $table->id();

            $table->string('type_code', 20)->unique()->notNullable();
            $table->string('type_name', 100)->notNullable();
            $table->text('description')->nullable();

            $table->decimal('base_charges_per_day', 10, 2)->nullable();

            $table->boolean('requires_deposit')->default(false);
            $table->decimal('deposit_amount', 10, 2)->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};

