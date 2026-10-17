<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'package_'.$this->uuid,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (int) $this->price_amount,
            'currency' => $this->currency,
            'duration_days' => (int) $this->duration_days,
            'active_listing_limit' => (int) $this->active_listing_limit,
            'featured_ads_limit' => $this->featured_ads_limit !== null ? (int) $this->featured_ads_limit : null,
            'features' => $this->features_json ?? [],
            'expired_ads_action' => $this->expired_ads_action instanceof \BackedEnum
                ? $this->expired_ads_action->value
                : $this->expired_ads_action,
            'is_active' => (bool) $this->is_active,
            'sort_order' => (int) $this->sort_order,
        ];
    }
}
