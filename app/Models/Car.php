<?php

namespace App\Models;

use App\Enums\CarCondition;
use App\Enums\CarStatus;
use App\Enums\FuelType;
use App\Enums\TransmissionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Car extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Transient reason for the current status change, consumed by
     * CarObserver (declared to keep it out of the attributes array).
     */
    public ?string $status_change_reason = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'seller_user_id',
        'showroom_id',
        'category_id',
        'make_id',
        'model_id',
        'make_text',
        'model_text',
        'title',
        'year',
        'price_amount',
        'currency',
        'mileage',
        'transmission',
        'fuel_type',
        'body_type',
        'color',
        'location',
        'description',
        'condition',
        'status',
        'is_featured',
        'reviewed_by',
        'reviewed_at',
        'review_reason',
        'rejection_metadata',
        'published_at',
        'sold_at',
        'views_count',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'price_amount' => 'integer',
            'mileage' => 'integer',
            'views_count' => 'integer',
            'is_featured' => 'boolean',
            'condition' => CarCondition::class,
            'status' => CarStatus::class,
            'transmission' => TransmissionType::class,
            'fuel_type' => FuelType::class,
            'reviewed_at' => 'datetime',
            'rejection_metadata' => 'array',
            'published_at' => 'datetime',
            'sold_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Car $car) {
            if (empty($car->uuid)) {
                $car->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * The individual seller, if any.
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_user_id');
    }

    /**
     * The showroom, if listed by one.
     */
    public function showroom(): BelongsTo
    {
        return $this->belongsTo(Showroom::class);
    }

    /**
     * The catalogue make, if linked.
     */
    public function make(): BelongsTo
    {
        return $this->belongsTo(CarMake::class, 'make_id');
    }

    /**
     * The catalogue model, if linked.
     */
    public function model(): BelongsTo
    {
        return $this->belongsTo(CarModel::class, 'model_id');
    }

    /**
     * The catalogue category, if set.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(CarCategory::class, 'category_id');
    }

    /**
     * The reviewer who last reviewed the listing.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Images ordered for display.
     */
    public function images(): HasMany
    {
        return $this->hasMany(CarImage::class)->orderBy('sort_order');
    }

    /**
     * Status change history.
     */
    public function statusHistory(): HasMany
    {
        return $this->hasMany(CarStatusHistory::class)->latest('id');
    }

    /**
     * Users who saved this car as a favorite.
     */
    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favorites');
    }

    /**
     * Purchase inquiries on this car.
     */
    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }
}
