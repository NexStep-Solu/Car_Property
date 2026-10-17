<?php

namespace App\Http\Resources;

use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseInquiryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'inquiry_'.$this->uuid,
            'message' => $this->message,
            'contact_phone' => $this->contact_phone,
            'contact_method' => $this->enumValue($this->contact_method),
            'status' => $this->enumValue($this->status),
            'car' => CarResource::make($this->whenLoaded('car')),
            'sender' => UserResource::make($this->whenLoaded('sender')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    protected function enumValue(mixed $value): mixed
    {
        return $value instanceof BackedEnum ? $value->value : $value;
    }
}
