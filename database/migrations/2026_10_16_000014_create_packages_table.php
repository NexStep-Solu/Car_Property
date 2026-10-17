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
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name', 100);
            $table->string('slug', 120)->unique();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('price_amount');
            $table->char('currency', 3);
            $table->unsignedInteger('duration_days');
            $table->unsignedInteger('active_listing_limit');
            $table->unsignedInteger('featured_ads_limit')->default(0);
            $table->json('features_json')->nullable();
            $table->string('expired_ads_action', 20)->default('hide');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // No foreign-key columns involved, safe on MySQL + PostgreSQL.
        if (in_array(DB::getDriverName(), ['mysql', 'pgsql'], true)) {
            DB::statement('ALTER TABLE `packages` ADD CONSTRAINT `packages_price_non_negative` CHECK (`price_amount` >= 0)');
            DB::statement('ALTER TABLE `packages` ADD CONSTRAINT `packages_duration_positive` CHECK (`duration_days` > 0)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
