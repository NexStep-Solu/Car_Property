<?php

namespace App\Policies;

use App\Models\SellerApplication;
use App\Models\User;
use App\Policies\Concerns\ResolvesTeamPermissions;

class SellerApplicationPolicy
{
    use ResolvesTeamPermissions;

    public function view(User $user, SellerApplication $application): bool
    {
        return $application->user_id === $user->id
            || $user->hasAnyRole(['super_admin', 'reviewer'], 'admin');
    }

    /**
     * NOTE: written as an explicit admin-guard check — a bare
     * $user->can('review seller documents') would resolve the default
     * (web) guard and throw RoleDoesNotExist.
     */
    public function review(User $user, SellerApplication $application): bool
    {
        return $this->safeHasPermissionTo($user, 'review seller documents', 'admin');
    }
}
