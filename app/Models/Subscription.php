<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Subscription extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'showroom_id',
        'package_id',
        'status',
        'starts_at',
        'ends_at',
        'active_listing_limit_snapshot',
        'price_amount_snapshot',
        'currency_snapshot',
        'listings_used',
        'expiry_reminder_sent_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => SubscriptionStatus::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'active_listing_limit_snapshot' => 'integer',
            'price_amount_snapshot' => 'integer',
            'listings_used' => 'integer',
            'expiry_reminder_sent_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Subscription $subscription) {
            if (empty($subscription->uuid)) {
                $subscription->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * The subscribing showroom.
     */
    public function showroom(): BelongsTo
    {
        return $this->belongsTo(Showroom::class);
    }

    /**
     * The package snapshot source.
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    /**
     * Payments made toward this subscription.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Reminder deliveries for this subscription.
     */
    public function reminderLogs(): HasMany
    {
        return $this->hasMany(SubscriptionReminderLog::class);
    }
}
