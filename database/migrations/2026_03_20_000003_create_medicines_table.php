<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->string('medicine_code', 50)->unique();
            $table->string('name');
            $table->string('generic_name')->nullable();
            $table->string('brand_name')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('medicine_categories')->nullOnDelete();
            $table->string('dosage_form', 50)->nullable();
            $table->string('strength', 50)->nullable();
            $table->string('unit', 50)->default('piece');
            $table->string('manufacturer')->nullable();
            $table->string('country_of_origin')->nullable();
            $table->string('sku', 50)->nullable();
            $table->string('barcode', 100)->nullable();
            $table->string('rack_location')->nullable();
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->decimal('selling_price', 12, 2)->default(0);
            $table->decimal('wholesale_price', 12, 2)->nullable();
            $table->integer('reorder_level')->default(10);
            $table->integer('minimum_stock')->default(5);
            $table->integer('maximum_stock')->nullable();
            $table->boolean('requires_prescription')->default(false);
            $table->boolean('is_controlled')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_vaccine')->default(false);
            $table->text('side_effects')->nullable();
            $table->text('contraindications')->nullable();
            $table->text('storage_instructions')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->index(['name']);
            $table->index(['category_id']);
            $table->index(['is_active']);
            $table->index(['medicine_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};
