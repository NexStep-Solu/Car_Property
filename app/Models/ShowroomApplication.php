<?php

namespace App\Models;

use App\Enums\ShowroomApplicationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ShowroomApplication extends Model
{
    use SoftDeletes;
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'showroom_id',
        'submitted_by',
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
            'status' => ShowroomApplicationStatus::class,
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (ShowroomApplication $application) {
            if (empty($application->uuid)) {
                $application->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * The showroom under verification.
     */
    public function showroom(): BelongsTo
    {
        return $this->belongsTo(Showroom::class);
    }

    /**
     * The user who submitted the application.
     */
    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    /**
     * The reviewer who last reviewed the application.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Documents attached to the application.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(ShowroomDocument::class);
    }
}
