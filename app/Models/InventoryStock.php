<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryStock extends Model
{
    use HasFactory;

    protected $table = 'inventory_stocks';

    protected $fillable = [
        'medicine_id',
        'supplier_id',
        'batch_number',
        'expiry_date',
        'manufacture_date',
        'quantity',
        'reserved_quantity',
        'damaged_quantity',
        'unit_cost',
        'unit_price',
        'pack_size',
        'warehouse',
        'shelf_location',
        'received_date',
        'last_count_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'manufacture_date' => 'date',
        'received_date' => 'date',
        'last_count_date' => 'date',
        'quantity' => 'integer',
        'reserved_quantity' => 'integer',
        'damaged_quantity' => 'integer',
        'unit_cost' => 'decimal:2',
        'unit_price' => 'decimal:2',
    ];

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function getDaysToExpiryAttribute(): ?int
    {
        if (!$this->expiry_date) {
            return null;
        }
        return now()->diffInDays($this->expiry_date, false);
    }

    public function getAvailableQuantityAttribute(): int
    {
        return $this->quantity - $this->reserved_quantity - $this->damaged_quantity;
    }

    public function getStockValueAttribute(): float
    {
        return $this->quantity * $this->unit_cost;
    }

    public static function generateBatchNumber(): string
    {
        return 'BAT' . date('Ymd') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
    }
}
