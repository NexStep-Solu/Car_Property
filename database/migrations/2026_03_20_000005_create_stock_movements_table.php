<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
            $table->foreignId('inventory_stock_id')->nullable()->constrained('inventory_stocks')->nullOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference_number', 100)->nullable();
            $table->enum('movement_type', [
                'purchase',
                'purchase_return',
                'sale',
                'sale_return',
                'adjustment',
                'transfer',
                'expired',
                'damaged',
                'recalled',
                'initial_stock',
                'damage_write_off',
                'theft'
            ]);
            $table->integer('quantity');
            $table->integer('previous_quantity')->default(0);
            $table->integer('new_quantity')->default(0);
            $table->decimal('unit_cost', 12, 2)->default(0);
            $table->decimal('total_cost', 12, 2)->default(0);
            $table->string('batch_number', 100)->nullable();
            $table->date('movement_date');
            $table->string('invoice_number', 100)->nullable();
            $table->string('challan_number', 100)->nullable();
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['medicine_id']);
            $table->index(['movement_type']);
            $table->index(['movement_date']);
            $table->index(['reference_number']);
            $table->index(['user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
