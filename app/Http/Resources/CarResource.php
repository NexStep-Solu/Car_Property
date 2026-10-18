<?php

namespace App\Http\Resources;

use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CarResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $sellerUser = $this->seller ?? $this->showroom?->owner;
        $sellerProfile = $sellerUser?->sellerProfile;

        return [
            // `id` is the prefixed public identifier; `uuid` is what the
            // `/cars/{car:uuid}` routes bind on. Clients that round-trip a car
            // between list and detail must send `uuid`.
            'id' => 'car_'.$this->uuid,
            'uuid' => $this->uuid,
            'title' => $this->title,
            'make' => $this->make_text ?? $this->make?->name,
            'model' => $this->model_text ?? $this->model?->name,
            'year' => $this->year,
            'price' => (int) $this->price_amount,
            'currency' => $this->currency,
            'mileage' => $this->mileage !== null ? (int) $this->mileage : null,
            'transmission' => $this->enumValue($this->transmission),
            'fuel_type' => $this->enumValue($this->fuel_type),
            'body_type' => $this->body_type,
            'condition' => $this->enumValue($this->condition),
            'color' => $this->color,
            'location' => $this->location,
            'description' => $this->description,
            'images' => CarImageResource::collection($this->whenLoaded('images')),
            'image_count' => $this->relationLoaded('images') ? $this->images->count() : null,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => 'cat_'.$this->category->uuid,
                'uuid' => $this->category->uuid,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'seller' => [
                'id' => $sellerUser ? 'seller_'.$sellerUser->uuid : null,
                'display_name' => $sellerProfile?->display_name
                    ?? $sellerUser?->name,
                'seller_type' => $sellerProfile?->seller_type?->value
                    ?? ($this->showroom_id ? 'showroom' : 'individual'),
                'verified' => $sellerProfile?->verification_status?->value === 'approved',
            ],
            // favoritedBy is eager-loaded by the controller when a token is
            // present, filtered to the current user. isNotEmpty() therefore
            // correctly reports whether the caller favorited this car.
            'favorited' => $this->when(
                $this->relationLoaded('favoritedBy'),
                fn () => $this->favoritedBy->isNotEmpty(),
            ),
            'status' => $this->enumValue($this->status),
            'is_featured' => (bool) $this->is_featured,
            'published_at' => $this->published_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'views_count' => (int) $this->views_count,
        ];
    }

    protected function enumValue(mixed $value): mixed
    {
        return $value instanceof BackedEnum ? $value->value : $value;
    }
}
