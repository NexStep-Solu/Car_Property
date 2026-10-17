<?php

namespace App\Policies;

use App\Models\Subscription;
use App\Models\User;
use App\Policies\Concerns\ResolvesTeamPermissions;

class SubscriptionPolicy
{
    use ResolvesTeamPermissions;

    protected function memberRole(User $user, int $showroomId): ?string
    {
        $showroom = \App\Models\Showroom::find($showroomId);
        if (! $showroom) {
            return null;
        }

        if ($showroom->owner_user_id === $user->id) {
            return 'owner';
        }

        return $showroom->users()->wherePivot('is_active', true)->where('users.id', $user->id)->first()?->pivot->member_role;
    }

    public function view(User $user, Subscription $subscription): bool
    {
        return $this->memberRole($user, $subscription->showroom_id) !== null
            || $this->isPlatformAdmin($user);
    }

    /**
     * Team-scoped purchase check: 'purchase package' in the showroom's
     * team context first, then platform-global. Owners always pass.
     */
    public function purchase(User $user, Subscription $subscription): bool
    {
        $showroom = $subscription->showroom;

        if ($showroom && $showroom->owner_user_id === $user->id) {
            return true;
        }

        if (in_array($this->memberRole($user, $subscription->showroom_id), ['owner', 'manager'], true)) {
            return true;
        }

        return $this->hasTeamPermission($user, 'purchase package', $subscription->showroom_id);
    }

    public function cancel(User $user, Subscription $subscription): bool
    {
        return $this->purchase($user, $subscription) || $this->isSuperAdmin($user);
    }
}
