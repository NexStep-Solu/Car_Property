<?php

namespace App\Http\Controllers\Api\V1;

use App\Jobs\ProcessWebhookEventJob;
use App\Models\PaymentWebhookEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WebhookController extends BaseApiController
{
    /**
     * Provider webhook ingress.
     *
     * The payload must be signed with the provider's webhook secret:
     * X-Webhook-Signature = hex HMAC-SHA256 of the raw request body.
     * Signature verification happens here (the raw body is not retained
     * for async processing); the unique (provider, event_id) index makes
     * provider redeliveries a safe no-op.
     */
    public function handle(Request $request, string $provider): JsonResponse
    {
        $secret = config("services.payments.providers.{$provider}.webhook_secret");

        if (! $secret) {
            abort(404);
        }

        $signature = (string) $request->header('X-Webhook-Signature');
        $expected = hash_hmac('sha256', $request->getContent(), $secret);

        if ($signature === '' || ! hash_equals($expected, $signature)) {
            return $this->error('INVALID_SIGNATURE', 'The webhook signature is invalid.', 401);
        }

        $payload = $request->json()->all();
        $eventId = $payload['event_id'] ?? null;
        $eventType = $payload['event_type'] ?? null;

        if (! is_string($eventId) || $eventId === '' || ! is_string($eventType) || $eventType === '') {
            throw ValidationException::withMessages([
                'event_id' => 'The event_id and event_type fields are required.',
            ]);
        }

        $event = PaymentWebhookEvent::firstOrCreate(
            ['provider' => $provider, 'event_id' => $eventId],
            [
                'event_type' => $eventType,
                'payload_safe' => $payload,
                'received_at' => now(),
            ]
        );

        if (! $event->wasRecentlyCreated) {
            return $this->ok(['duplicate' => true]);
        }

        ProcessWebhookEventJob::dispatch($event->id);

        return $this->created(['received' => true]);
    }
}
