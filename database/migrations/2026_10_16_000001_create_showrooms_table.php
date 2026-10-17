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
        Schema::create('showrooms', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('owner_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('business_name', 180);
            $table->string('slug', 200)->unique();
            $table->string('registration_number', 100)->nullable();
            $table->string('phone', 30);
            $table->string('email', 254)->nullable();
            $table->text('address');
            $table->string('region', 100)->nullable()->index();
            $table->string('logo_storage_key', 500)->nullable();
            $table->text('description')->nullable();
            $table->string('verification_status', 30)->default('pending')->index();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('showrooms');
    }
};
