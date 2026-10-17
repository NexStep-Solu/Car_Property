<?php

namespace App\Models;

use App\Enums\InquiryStatus;
use App\Enums\PreferredContactMethod;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Inquiry extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'car_id',
        'sender_user_id',
        'receiver_user_id',
        'message',
        'contact_phone',
        'contact_method',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'contact_method' => PreferredContactMethod::class,
            'status' => InquiryStatus::class,
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Inquiry $inquiry) {
            if (empty($inquiry->uuid)) {
                $inquiry->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * The car being inquired about, if still listed.
     */
    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    /**
     * The inquiring user.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

    /**
     * The resolved recipient (car seller or showroom owner).
     */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_user_id');
    }
}
