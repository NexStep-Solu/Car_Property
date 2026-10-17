<?php

namespace App\Models;

use App\Enums\SellerApplicationStatus;
use App\Enums\SellerType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SellerApplication extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'seller_type',
        'full_name',
        'phone',
        'email',
        'address',
        'accepted_terms',
        'accepted_terms_at',
        'status',
        'submitted_at',
        'reviewed_by',
        'reviewed_at',
        'review_reason',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'seller_type' => SellerType::class,
            'status' => SellerApplicationStatus::class,
            'accepted_terms' => 'boolean',
            'accepted_terms_at' => 'datetime',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (SellerApplication $application) {
            if (empty($application->uuid)) {
                $application->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * The applicant user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The reviewer who last reviewed the application.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Identity documents attached to the application.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(IdentityDocument::class);
    }
}
