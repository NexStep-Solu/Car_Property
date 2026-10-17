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
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('seller_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('showroom_id')->nullable()->constrained('showrooms')->nullOnDelete();
            $table->foreignId('category_id')
                ->nullable()
                ->after('showroom_id')
                ->constrained('car_categories')
                ->nullOnDelete();

            $table->index('category_id');
            $table->foreignId('make_id')->nullable()->constrained('car_makes')->nullOnDelete();
            $table->foreignId('model_id')->nullable()->constrained('car_models')->nullOnDelete();
            $table->string('make_text', 100)->nullable();
            $table->string('model_text', 100)->nullable();
            $table->string('title', 180);
            $table->unsignedSmallInteger('year');
            $table->unsignedBigInteger('price_amount');
            $table->char('currency', 3);
            $table->unsignedBigInteger('mileage')->nullable();
            $table->string('transmission', 30)->nullable();
            $table->string('fuel_type', 30)->nullable();
            $table->string('body_type', 40)->nullable();
            $table->string('color', 40)->nullable();
            $table->string('location', 180);
            $table->text('description')->nullable();
            $table->string('condition', 20)->default('used');
            $table->string('status', 30)->default('pending_review');
            $table->boolean('is_featured')->default(false);
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_reason')->nullable();
            $table->json('rejection_metadata')
                ->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('sold_at')->nullable();
            $table->unsignedBigInteger('views_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'published_at']);
            $table->index(['status', 'location']);
            $table->index(['status', 'price_amount']);
            $table->index(['make_id', 'model_id']);
            $table->index(['showroom_id', 'status']);
            $table->index(['seller_user_id', 'status']);
        });

        // Data-integrity checks. SQLite parses CHECKs but historically
        // ignores them, so apply only where they are actually enforced.
        // NOTE: MySQL refuses CHECK constraints on foreign-key columns
        // (error 3823), so the seller/showroom XOR lives there only on
        // PostgreSQL and is enforced at the application layer otherwise.
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE `cars` ADD CONSTRAINT `cars_seller_xor_showroom` CHECK ((`seller_user_id` IS NULL) <> (`showroom_id` IS NULL))');
            DB::statement('ALTER TABLE `cars` ADD CONSTRAINT `cars_price_non_negative` CHECK (`price_amount` >= 0)');
            DB::statement('ALTER TABLE `cars` ADD CONSTRAINT `cars_mileage_non_negative` CHECK (`mileage` IS NULL OR `mileage` >= 0)');
            DB::statement('ALTER TABLE `cars` ADD CONSTRAINT `cars_year_range` CHECK (`year` BETWEEN 1950 AND 2100)');
        } elseif (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE `cars` ADD CONSTRAINT `cars_price_non_negative` CHECK (`price_amount` >= 0)');
            DB::statement('ALTER TABLE `cars` ADD CONSTRAINT `cars_mileage_non_negative` CHECK (`mileage` IS NULL OR `mileage` >= 0)');
            DB::statement('ALTER TABLE `cars` ADD CONSTRAINT `cars_year_range` CHECK (`year` BETWEEN 1950 AND 2100)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
