<?php

namespace App\Policies\Concerns;

use App\Models\User;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;
use Spatie\Permission\PermissionRegistrar;

/**
 * Team-aware Spatie permission evaluation.
 *
 * All current grants are platform-global (null team), but showroom-scoped
 * grants may exist later. The team resolver is request-persistent, so the
 * previous team id is always restored and memoized relations are cleared
 * around the switch — otherwise one check would poison later ones.
 */
trait ResolvesTeamPermissions
{
    /**
     * Check a web-guard permission for a team, falling back to global.
     */
    protected function hasTeamPermission(User $user, string $permission, ?int $teamId): bool
    {
        $registrar = app(PermissionRegistrar::class);
        $previousTeamId = $registrar->getPermissionsTeamId();

        try {
            $registrar->setPermissionsTeamId($teamId);
            $user->unsetRelation('roles')->unsetRelation('permissions');
            if ($teamId !== null && $this->safeHasPermissionTo($user, $permission)) {
                return true;
            }

            $registrar->setPermissionsTeamId(null);
            $user->unsetRelation('roles')->unsetRelation('permissions');

            return $this->safeHasPermissionTo($user, $permission);
        } finally {
            $registrar->setPermissionsTeamId($previousTeamId);
            $user->unsetRelation('roles')->unsetRelation('permissions');
        }
    }

    /**
     * Guard-aware permission check that denies (instead of throwing)
     * when the permission row does not exist (e.g. unseeded database).
     */
    protected function safeHasPermissionTo(User $user, string $permission, ?string $guard = null): bool
    {
        try {
            return $guard === null
                ? $user->hasPermissionTo($permission)
                : $user->hasPermissionTo($permission, $guard);
        } catch (PermissionDoesNotExist) {
            return false;
        }
    }

    protected function isPlatformAdmin(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'reviewer', 'support'], 'admin');
    }

    protected function isSuperAdmin(User $user): bool
    {
        return $user->hasRole('super_admin', 'admin');
    }
}
