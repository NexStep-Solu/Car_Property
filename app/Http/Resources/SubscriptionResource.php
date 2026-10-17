<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'subscription_'.$this->uuid,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'active_listing_limit' => (int) $this->active_listing_limit_snapshot,
            'price' => (int) $this->price_amount_snapshot,
            'currency' => $this->currency_snapshot,
            'listings_used' => (int) $this->listings_used,
            'package' => PackageResource::make($this->whenLoaded('package')),
            'showroom' => $this->whenLoaded('showroom', fn () => [
                'id' => 'showroom_'.$this->showroom->uuid,
                'business_name' => $this->showroom->business_name,
                'slug' => $this->showroom->slug,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
