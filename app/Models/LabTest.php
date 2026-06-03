<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabTest extends Model
{
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'test_name',
        'test_code',
        'category',
        'ordered_date',
        'result_date',
        'result',
        'normal_range',
        'unit',
        'status',
        'notes',
        'branch_id',
    ];

    protected function casts(): array
    {
        return [
            'ordered_date' => 'date',
            'result_date' => 'date',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
