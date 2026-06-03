<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IpdRecord extends Model
{
    protected $fillable = [
        'patient_id',
        'bed_id',
        'admission_date',
        'discharge_date',
        'admission_reason',
        'diagnosis',
        'treatment_plan',
        'attending_doctor_id',
        'status',
        'room_charge',
        'nursing_charge',
        'other_charges',
        'total_charges',
        'notes',
        'branch_id',
    ];

    protected function casts(): array
    {
        return [
            'admission_date' => 'datetime',
            'discharge_date' => 'datetime',
            'room_charge' => 'decimal:2',
            'nursing_charge' => 'decimal:2',
            'other_charges' => 'decimal:2',
            'total_charges' => 'decimal:2',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class);
    }

    public function attendingDoctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'attending_doctor_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
