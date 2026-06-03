<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OpdRecord extends Model
{
    protected $fillable = [
        'patient_id',
        'appointment_id',
        'department_id',
        'doctor_id',
        'opd_number',
        'visit_date',
        'visit_time',
        'visit_type',
        'chief_complaint',
        'history',
        'examination',
        'diagnosis',
        'treatment',
        'advice',
        'notes',
        'status',
        'consultation_fee',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'visit_time' => 'datetime:H:i',
        'consultation_fee' => 'decimal:2',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'doctor_id');
    }

    public static function generateOpdNumber()
    {
        $prefix = 'OPD';
        $date = now()->format('Ymd');
        $lastRecord = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $lastNumber = $lastRecord ? intval(substr($lastRecord->opd_number, -4)) : 0;
        return $prefix . $date . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
    }
}
