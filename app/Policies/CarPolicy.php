<?php

namespace App\Policies;

use App\Models\Car;
use App\Models\User;
use App\Policies\Concerns\ResolvesTeamPermissions;

class CarPolicy
{
    use ResolvesTeamPermissions;

    /**
     * All authenticated users may browse the catalogue
     * (the controller still scopes which rows are visible).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Car $car): bool
    {
        if ($car->status === \App\Enums\CarStatus::Published) {
            return true;
        }

        if ($this->isOwner($user, $car) || $this->isPlatformAdmin($user)) {
            return true;
        }

        return in_array($this->showroomRole($user, $car->showroom_id), ['owner', 'manager'], true);
    }

    public function create(User $user): bool
    {
        return $this->safeHasPermissionTo($user, 'manage own listings');
    }

    public function update(User $user, Car $car): bool
    {
        if ($car->showroom_id) {
            // Owners and Super Admins always pass (matches the
            // controllers); team/global permission covers managers/staff.
            if ($this->isOwner($user, $car) || $this->isSuperAdmin($user)) {
                return true;
            }

            // Team-scoped check (falls back to platform-global grants,
            // which is where all current assignments live).
            return $this->hasTeamPermission($user, 'manage own listings', $car->showroom_id);
        }

        return $car->seller_user_id !== null && (int) $car->seller_user_id === $user->id;
    }

    public function delete(User $user, Car $car): bool
    {
        return $this->update($user, $car);
    }

    /**
     * NOTE: $user->can('approve cars') cannot work — can() resolves the
     * default (web) guard while the permission lives on the admin guard
     * (it would throw RoleDoesNotExist). The explicit guard check below
     * is the correct equivalent.
     */
    public function approve(User $user, Car $car): bool
    {
        return $this->safeHasPermissionTo($user, 'approve cars', 'admin');
    }

    protected function isOwner(User $user, Car $car): bool
    {
        if ($car->seller_user_id && (int) $car->seller_user_id === $user->id) {
            return true;
        }

        return $car->showroom_id
            && \App\Models\Showroom::where('id', $car->showroom_id)->where('owner_user_id', $user->id)->exists();
    }

    protected function showroomRole(User $user, ?int $showroomId): ?string
    {
        if (! $showroomId) {
            return null;
        }

        $showroom = \App\Models\Showroom::find($showroomId);
        if (! $showroom) {
            return null;
        }

        if ($showroom->owner_user_id === $user->id) {
            return 'owner';
        }

        return $showroom->users()->wherePivot('is_active', true)->where('users.id', $user->id)->first()?->pivot->member_role;
    }
}
