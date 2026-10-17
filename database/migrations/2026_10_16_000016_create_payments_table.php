<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->nullOnDelete();
            $table->foreignId('payer_user_id')->constrained('users');
            $table->string('provider', 60);
            $table->string('provider_reference', 180)->nullable()->unique();
            $table->unsignedBigInteger('amount');
            $table->char('currency', 3);
            $table->string('status', 30)->default('pending');
            $table->string('idempotency_key', 180)->nullable()->unique();
            $table->timestamp('paid_at')->nullable();
            $table->json('provider_payload_safe')->nullable();
            $table->string('receipt_storage_key', 500)->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });

        // No foreign-key columns involved, safe on MySQL + PostgreSQL.
        if (in_array(DB::getDriverName(), ['mysql', 'pgsql'], true)) {
            DB::statement('ALTER TABLE `payments` ADD CONSTRAINT `payments_amount_non_negative` CHECK (`amount` >= 0)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
