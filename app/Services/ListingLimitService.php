<?php

namespace App\Services;

use App\Enums\SubscriptionStatus;
use App\Models\Showroom;
use App\Models\Subscription;

class ListingLimitService
{
    /**
     * Active subscription of the showroom, if any.
     */
    public function activeSubscription(Showroom $showroom): ?Subscription
    {
        return Subscription::where('showroom_id', $showroom->id)
            ->where('status', SubscriptionStatus::Active->value)
            ->latest('id')
            ->first();
    }

    /**
     * Count listings that occupy a slot (everything except
     * archived, sold and expired).
     */
    public function usedSlots(Showroom $showroom): int
    {
        return $showroom->cars()
            ->whereNotIn('status', ['archived', 'sold', 'expired'])
            ->count();
    }

    /**
     * Whether the showroom may list another car.
     *
     * @return array{allowed: bool, used: int, limit: int|null, reason: string|null}
     */
    public function check(Showroom $showroom): array
    {
        $subscription = $this->activeSubscription($showroom);

        if (! $subscription) {
            return ['allowed' => false, 'used' => 0, 'limit' => null, 'reason' => 'SUBSCRIPTION_REQUIRED'];
        }

        $limit = (int) $subscription->active_listing_limit_snapshot;

        // 0 = unlimited.
        if ($limit === 0) {
            return ['allowed' => true, 'used' => $this->usedSlots($showroom), 'limit' => 0, 'reason' => null];
        }

        $used = $this->usedSlots($showroom);

        if ($used >= $limit) {
            return ['allowed' => false, 'used' => $used, 'limit' => $limit, 'reason' => 'LISTING_LIMIT_REACHED'];
        }

        return ['allowed' => true, 'used' => $used, 'limit' => $limit, 'reason' => null];
    }
}
