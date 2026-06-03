<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Insurance extends Model
{
    protected $fillable = [
        'patient_id',
        'branch_id',
        'insurance_provider',
        'policy_number',
        'group_number',
        'plan_name',
        'coverage_start_date',
        'coverage_end_date',
        'coverage_percentage',
        'max_coverage_amount',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'coverage_start_date' => 'date',
            'coverage_end_date' => 'date',
            'coverage_percentage' => 'decimal:2',
            'max_coverage_amount' => 'decimal:2',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
