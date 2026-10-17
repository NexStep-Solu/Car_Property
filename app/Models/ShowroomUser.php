<?php

namespace App\Models;

use App\Enums\ShowroomMemberRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShowroomUser extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'showroom_id',
        'user_id',
        'member_role',
        'is_active',
        'joined_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'member_role' => ShowroomMemberRole::class,
            'is_active' => 'boolean',
            'joined_at' => 'datetime',
        ];
    }

    /**
     * The showroom this membership belongs to.
     */
    public function showroom(): BelongsTo
    {
        return $this->belongsTo(Showroom::class);
    }

    /**
     * The member user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
