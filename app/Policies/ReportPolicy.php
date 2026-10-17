<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;
use App\Policies\Concerns\ResolvesTeamPermissions;

class ReportPolicy
{
    use ResolvesTeamPermissions;

    /**
     * Any authenticated user may file a report (the policy only ever
     * receives authenticated users).
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * NOTE: written as an explicit admin-guard check — a bare
     * $user->can('handle reports') would resolve the default (web)
     * guard and throw RoleDoesNotExist.
     */
    public function handle(User $user, Report $report): bool
    {
        return $this->safeHasPermissionTo($user, 'handle reports', 'admin');
    }
}
