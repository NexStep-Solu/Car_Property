<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomType extends Model
{
    use HasFactory;

    protected $fillable = [
        'type_code',
        'type_name',
        'description',
        'base_charges_per_day',
        'requires_deposit',
        'deposit_amount',
        'is_active',
    ];

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
}

