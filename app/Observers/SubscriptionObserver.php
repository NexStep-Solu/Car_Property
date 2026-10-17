<?php

namespace App\Observers;

use App\Enums\SubscriptionStatus;
use App\Models\Subscription;
use App\Support\AuditLogger;

class SubscriptionObserver
{
    public function updating(Subscription $subscription): void
    {
        if (! $subscription->isDirty('status')) {
            return;
        }

        $to = $subscription->status instanceof \BackedEnum ? $subscription->status->value : (string) $subscription->status;

        // Fill the billing window when a subscription goes active.
        if ($to === SubscriptionStatus::Active->value) {
            $subscription->starts_at ??= now();
            if (empty($subscription->ends_at)) {
                $duration = $subscription->package?->duration_days ?? 30;
                $subscription->ends_at = now()->addDays($duration);
            }
        }

        AuditLogger::log('subscription.status_changed', $subscription, null, [
            'from' => $subscription->getRawOriginal('status'),
            'to' => $to,
        ]);
    }
}
