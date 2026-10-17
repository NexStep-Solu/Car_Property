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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('showroom_id')->constrained('showrooms')->cascadeOnDelete();
            $table->foreignId('package_id')->constrained('packages');
            $table->string('status', 30)->default('pending_payment');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->unsignedInteger('active_listing_limit_snapshot');
            $table->unsignedBigInteger('price_amount_snapshot');
            $table->char('currency_snapshot', 3);
            $table->unsignedInteger('listings_used')->default(0);
            $table->timestamp('expiry_reminder_sent_at')->nullable();
            $table->timestamps();

            $table->index(['showroom_id', 'status']);
            $table->index(['status', 'ends_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
