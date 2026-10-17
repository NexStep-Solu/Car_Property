<?php

namespace App\Models;

use App\Enums\ExpiredAdsAction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Package extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_amount',
        'currency',
        'duration_days',
        'active_listing_limit',
        'featured_ads_limit',
        'features_json',
        'expired_ads_action',
        'is_active',
        'sort_order',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price_amount' => 'integer',
            'duration_days' => 'integer',
            'active_listing_limit' => 'integer',
            'featured_ads_limit' => 'integer',
            'features_json' => 'array',
            'expired_ads_action' => ExpiredAdsAction::class,
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Package $package) {
            if (empty($package->uuid)) {
                $package->uuid = (string) Str::uuid();
            }
            if (empty($package->slug) && ! empty($package->name)) {
                $package->slug = Str::slug($package->name);
            }
        });
    }

    /**
     * Subscriptions sold under this package.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
