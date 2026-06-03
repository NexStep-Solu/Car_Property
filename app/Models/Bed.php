<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bed extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'bed_number',
        'bed_type',
        'has_ventilator',
        'has_monitor',
        'has_suction',
        'has_oxygen',
        'status',
        'is_isolated',
        'current_patient_id',
        'current_encounter_id',
        'occupied_since',
        'expected_vacate_date',
        'is_active',
        'last_cleaned_date',
        'last_cleaned_by',
        'notes',
    ];

    protected $casts = [
        'occupied_since' => 'datetime',
        'expected_vacate_date' => 'datetime',
        'last_cleaned_date' => 'datetime',
        'has_ventilator' => 'boolean',
        'has_monitor' => 'boolean',
        'has_suction' => 'boolean',
        'has_oxygen' => 'boolean',
        'is_isolated' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'current_patient_id', 'patient_id');
    }

    public function lastCleaner(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'last_cleaned_by');
    }
}

