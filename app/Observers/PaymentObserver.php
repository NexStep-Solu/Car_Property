<?php

namespace App\Observers;

use App\Enums\PaymentStatus;
use App\Enums\SubscriptionStatus;
use App\Models\Notification;
use App\Models\Payment;
use App\Support\AuditLogger;

class PaymentObserver
{
    public function updating(Payment $payment): void
    {
        $to = $payment->status instanceof \BackedEnum ? $payment->status->value : (string) $payment->status;
        $from = $payment->getRawOriginal('status');

        if ($to !== PaymentStatus::Succeeded->value || $from === PaymentStatus::Succeeded->value) {
            return;
        }

        $subscription = $payment->subscription;

        if ($subscription && $subscription->status !== SubscriptionStatus::Active) {
            $subscription->update(['status' => SubscriptionStatus::Active->value]);
        }

        if ($subscription?->showroom?->owner) {
            Notification::pushTo(
                $subscription->showroom->owner,
                'payment.succeeded',
                'Payment confirmed',
                "Payment #{$payment->id} ({$payment->amount} {$payment->currency}) was confirmed.",
                ['payment_id' => $payment->id, 'subscription_id' => $subscription?->id]
            );
        }

        AuditLogger::log('payment.status_changed', $payment, null, [
            'from' => $from,
            'to' => $to,
        ]);
    }
}
