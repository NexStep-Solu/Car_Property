<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurgerySchedule extends Model
{
    protected $fillable = [
        'patient_id',
        'operation_theater_id',
        'surgeon_id',
        'anesthetist_id',
        'ipd_record_id',
        'surgery_number',
        'surgery_name',
        'surgery_type',
        'status',
        'scheduled_date',
        'scheduled_time',
        'estimated_duration',
        'actual_duration',
        'pre_op_diagnosis',
        'post_op_diagnosis',
        'complications',
        'notes',
        'charges',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'scheduled_time' => 'datetime:H:i',
        'charges' => 'decimal:2',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function operationTheater(): BelongsTo
    {
        return $this->belongsTo(OperationTheater::class);
    }

    public function surgeon(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'surgeon_id');
    }

    public function anesthetist(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'anesthetist_id');
    }

    public function ipdRecord(): BelongsTo
    {
        return $this->belongsTo(IpdRecord::class);
    }

    public static function generateSurgeryNumber()
    {
        $prefix = 'SUR';
        $date = now()->format('Ymd');
        $lastRecord = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $lastNumber = $lastRecord ? intval(substr($lastRecord->surgery_number, -4)) : 0;
        return $prefix . $date . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
    }
}
