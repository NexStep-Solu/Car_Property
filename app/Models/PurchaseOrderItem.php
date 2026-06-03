<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'medicine_id',
        'batch_number',
        'expiry_date',
        'ordered_quantity',
        'received_quantity',
        'rejected_quantity',
        'unit_cost',
        'tax_rate',
        'discount_rate',
        'line_total',
        'notes',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'ordered_quantity' => 'integer',
        'received_quantity' => 'integer',
        'rejected_quantity' => 'integer',
        'unit_cost' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'discount_rate' => 'decimal:2',
        'line_total' => 'decimal:2',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function getPendingQuantityAttribute(): int
    {
        return $this->ordered_quantity - $this->received_quantity;
    }

    public function isFullyReceived(): bool
    {
        return $this->received_quantity >= $this->ordered_quantity;
    }

    public function calculateLineTotal(): float
    {
        $subtotal = $this->ordered_quantity * $this->unit_cost;
        $discount = $subtotal * ($this->discount_rate / 100);
        $afterDiscount = $subtotal - $discount;
        $tax = $afterDiscount * ($this->tax_rate / 100);
        return $afterDiscount + $tax;
    }
}
