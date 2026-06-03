<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'room_number',
        'room_type_id',
        'floor_id',
        'building_id',
        'department_id',
        'capacity',
        'current_occupancy',
        'square_feet',
        'amenities',
        'wing',
        'corridor',
        'status',
        'cleaning_status',
        'room_charges_per_day',
        'nursing_charges_per_day',
        'equipment_charges_per_day',
        'is_active',
        'last_maintenance_date',
        'next_maintenance_date',
        'notes',
    ];

    protected $casts = [
        'room_charges_per_day' => 'decimal:2',
        'nursing_charges_per_day' => 'decimal:2',
        'equipment_charges_per_day' => 'decimal:2',
        'last_maintenance_date' => 'date',
        'next_maintenance_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(\App\Models\Message::class);
    }

    public static function generateRoomNumber(): string
    {
        $lastRoom = self::orderBy('id', 'desc')->first();
        $number = $lastRoom ? ((int) substr($lastRoom->room_number, 2)) + 1 : 1;
        return 'RM' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }
}
