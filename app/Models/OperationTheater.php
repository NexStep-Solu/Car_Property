<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OperationTheater extends Model
{
    protected $fillable = [
        'name',
        'code',
        'location',
        'capacity',
        'is_available',
        'equipment',
        'notes',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    public function surgerySchedules(): HasMany
    {
        return $this->hasMany(SurgerySchedule::class);
    }
}
