<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientQueue extends Model
{
    protected $fillable = [
        'patient_id',
        'department_id',
        'appointment_id',
        'employee_id',
        'queue_number',
        'position',
        'status',
        'priority',
        'notes',
        'called_at',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'called_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public static function generateQueueNumber($prefix = 'Q')
    {
        $date = now()->format('Ymd');
        $lastQueue = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $lastNumber = $lastQueue ? intval(substr($lastQueue->queue_number, -4)) : 0;
        return $prefix . $date . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
    }
}
