<?php

namespace App\Models;

use App\Enums\ShowroomVerificationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Showroom extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'owner_user_id',
        'business_name',
        'slug',
        'registration_number',
        'phone',
        'email',
        'address',
        'region',
        'logo_storage_key',
        'description',
        'verification_status',
        'approved_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'verification_status' => ShowroomVerificationStatus::class,
            'approved_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Showroom $showroom) {
            if (empty($showroom->uuid)) {
                $showroom->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * The showroom owner.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    /**
     * Users attached to the showroom via the membership pivot.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'showroom_users')
            ->withPivot(['member_role', 'is_active', 'joined_at'])
            ->withTimestamps();
    }

    /**
     * Verification applications submitted for the showroom.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(ShowroomApplication::class);
    }

    /**
     * Cars listed under this showroom.
     */
    public function cars(): HasMany
    {
        return $this->hasMany(Car::class);
    }
}
