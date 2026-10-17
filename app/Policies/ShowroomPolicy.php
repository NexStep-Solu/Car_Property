<?php

namespace App\Policies;

use App\Models\Showroom;
use App\Models\User;
use App\Policies\Concerns\ResolvesTeamPermissions;

class ShowroomPolicy
{
    use ResolvesTeamPermissions;

    protected function memberRole(User $user, Showroom $showroom): ?string
    {
        if ($showroom->owner_user_id === $user->id) {
            return 'owner';
        }

        return $showroom->users()->wherePivot('is_active', true)->where('users.id', $user->id)->first()?->pivot->member_role;
    }

    public function view(User $user, Showroom $showroom): bool
    {
        return $this->memberRole($user, $showroom) !== null
            || $this->isPlatformAdmin($user);
    }

    /**
     * Team-scoped update check: evaluates 'manage showroom' in the
     * showroom's team context first, then platform-global. Owners and
     * Super Admins always pass.
     */
    public function update(User $user, Showroom $showroom): bool
    {
        if ($showroom->owner_user_id === $user->id || $this->isSuperAdmin($user)) {
            return true;
        }

        return $this->hasTeamPermission($user, 'manage showroom', $showroom->id);
    }

    /**
     * Team-scoped staff-management check.
     */
    public function manageStaff(User $user, Showroom $showroom): bool
    {
        if ($showroom->owner_user_id === $user->id || $this->isSuperAdmin($user)) {
            return true;
        }

        if ($this->memberRole($user, $showroom) === 'manager') {
            return true;
        }

        return $this->hasTeamPermission($user, 'manage showroom staff', $showroom->id);
    }
}
