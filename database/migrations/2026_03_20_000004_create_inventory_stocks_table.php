<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->string('batch_number', 100)->nullable();
            $table->date('expiry_date')->nullable();
            $table->date('manufacture_date')->nullable();
            $table->integer('quantity')->default(0);
            $table->integer('reserved_quantity')->default(0);
            $table->integer('damaged_quantity')->default(0);
            $table->decimal('unit_cost', 12, 2)->default(0);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->string('pack_size', 50)->nullable();
            $table->string('warehouse')->nullable();
            $table->string('shelf_location')->nullable();
            $table->date('received_date')->nullable();
            $table->date('last_count_date')->nullable();
            $table->enum('status', ['available', 'reserved', 'damaged', 'expired', 'recalled'])->default('available');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['medicine_id']);
            $table->index(['supplier_id']);
            $table->index(['batch_number']);
            $table->index(['expiry_date']);
            $table->index(['status']);
            $table->index(['warehouse']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_stocks');
    }
};
