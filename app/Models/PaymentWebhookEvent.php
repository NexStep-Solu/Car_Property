<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentWebhookEvent extends Model
{
    protected $fillable = [
        'provider', 'event_id', 'event_type',
        'payload_safe', 'received_at', 'processed_at',
        'attempts', 'last_error',
    ];

    protected function casts(): array
    {
        return [
            'payload_safe' => 'array',
            'received_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }
}
