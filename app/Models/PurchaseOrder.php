<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'supplier_id',
        'user_id',
        'branch_id',
        'order_date',
        'expected_delivery_date',
        'actual_delivery_date',
        'status',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'invoice_number',
        'payment_terms',
        'delivery_address',
        'notes',
        'internal_notes',
    ];

    protected $casts = [
        'order_date' => 'date',
        'expected_delivery_date' => 'date',
        'actual_delivery_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function getTotalReceivedAttribute(): int
    {
        return $this->items->sum('received_quantity');
    }

    public function getTotalOrderedAttribute(): int
    {
        return $this->items->sum('ordered_quantity');
    }

    public function isFullyReceived(): bool
    {
        return $this->items->every(function ($item) {
            return $item->received_quantity >= $item->ordered_quantity;
        });
    }

    public static function generateOrderNumber(): string
    {
        $lastOrder = self::orderBy('id', 'desc')->first();
        $number = $lastOrder ? ((int) substr($lastOrder->order_number, 2)) + 1 : 1;
        return 'PO' . date('ymd') . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    public static function getStatuses(): array
    {
        return [
            'draft' => 'Draft',
            'pending' => 'Pending Approval',
            'approved' => 'Approved',
            'ordered' => 'Ordered',
            'partial_received' => 'Partial Received',
            'received' => 'Received',
            'cancelled' => 'Cancelled',
        ];
    }
}
