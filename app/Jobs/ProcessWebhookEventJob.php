<?php

namespace App\Jobs;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\PaymentWebhookEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use RuntimeException;
use Throwable;

class ProcessWebhookEventJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $eventId) {}

    /**
     * Apply the webhook event to the matching payment. Succeeded payments
     * cascade through PaymentObserver → SubscriptionObserver (activation,
     * billing window, owner notification, audit).
     */
    public function handle(): void
    {
        $event = PaymentWebhookEvent::find($this->eventId);

        if (! $event || $event->processed_at) {
            return;
        }

        try {
            $this->applyPaymentUpdate($event);

            $event->update(['processed_at' => now(), 'last_error' => null]);
        } catch (Throwable $e) {
            $event->update([
                'attempts' => $event->attempts + 1,
                'last_error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    protected function applyPaymentUpdate(PaymentWebhookEvent $event): void
    {
        $payload = $event->payload_safe ?? [];
        $status = $this->resolveStatus($event->event_type, $payload);

        if ($status === null) {
            return;
        }

        $reference = $payload['provider_reference'] ?? null;

        if (! is_string($reference) || $reference === '') {
            throw new RuntimeException('Webhook payload is missing provider_reference.');
        }

        $payment = Payment::where('provider', $event->provider)
            ->where('provider_reference', $reference)
            ->first();

        if (! $payment) {
            throw new RuntimeException("Payment [{$reference}] for provider [{$event->provider}] was not found.");
        }

        if ($payment->status !== $status) {
            $update = ['status' => $status->value];

            if ($status === PaymentStatus::Succeeded) {
                $update['paid_at'] = now();
            }

            $payment->update($update);
        }

        $payment->update(['provider_payload_safe' => $payload]);
    }

    protected function resolveStatus(string $eventType, array $payload): ?PaymentStatus
    {
        return match ($eventType) {
            'payment.succeeded' => PaymentStatus::Succeeded,
            'payment.failed' => PaymentStatus::Failed,
            'payment.refunded' => PaymentStatus::Refunded,
            default => PaymentStatus::tryFrom((string) ($payload['status'] ?? '')),
        };
    }
}
