<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Patient extends Model
{
    protected $primaryKey = 'patient_id';
    public $incrementing = true;
    protected $keyType = 'int';
    
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'date_of_birth',
        'gender',
        'blood_group',
        'marital_status',
        'occupation',
        'nationality',
        'preferred_language',
        'registration_date',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        'profile_photo_url',
        'notes',
        'is_deceased',
        'deceased_date',
        'branch_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'registration_date' => 'date',
        'deceased_date' => 'date',
        'is_deceased' => 'boolean',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'patient_id', 'patient_id');
    }

    public function billings(): HasMany
    {
        return $this->hasMany(Billing::class, 'patient_id', 'patient_id');
    }

    public function ipdRecords(): HasMany
    {
        return $this->hasMany(IpdRecord::class, 'patient_id', 'patient_id');
    }

    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class, 'patient_id', 'patient_id');
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class, 'patient_id', 'patient_id');
    }

    public function vitals(): HasMany
    {
        return $this->hasMany(Vital::class, 'patient_id', 'patient_id');
    }

    public function labTests(): HasMany
    {
        return $this->hasMany(LabTest::class, 'patient_id', 'patient_id');
    }

    public function insurances(): HasMany
    {
        return $this->hasMany(Insurance::class, 'patient_id', 'patient_id');
    }
}
