<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Billing extends Model
{
    protected $fillable = [
        'patient_id',
        'invoice_number',
        'billing_date',
        'due_date',
        'subtotal',
        'tax',
        'discount',
        'total',
        'amount_paid',
        'status',
        'payment_method',
        'payment_date',
        'notes',
        'branch_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'billing_date' => 'date',
            'due_date' => 'date',
            'payment_date' => 'date',
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
            'amount_paid' => 'decimal:2',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(BillingItem::class);
    }
}
