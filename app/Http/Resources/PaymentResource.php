<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'payment_'.$this->uuid,
            'provider' => $this->provider,
            'provider_reference' => $this->provider_reference,
            'amount' => (int) $this->amount,
            'currency' => $this->currency,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'subscription' => SubscriptionResource::make($this->whenLoaded('subscription')),
            'payer' => UserResource::make($this->whenLoaded('payer')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
