<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CarModel extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'make_id',
        'name',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * The make this model belongs to.
     */
    public function make(): BelongsTo
    {
        return $this->belongsTo(CarMake::class, 'make_id');
    }

    /**
     * Cars listed under this model.
     */
    public function cars(): HasMany
    {
        return $this->hasMany(Car::class, 'model_id');
    }
}
