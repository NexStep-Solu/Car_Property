<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerApplicationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'seller_app_'.$this->uuid,
            'seller_type' => $this->seller_type instanceof \BackedEnum ? $this->seller_type->value : $this->seller_type,
            'full_name' => $this->full_name,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'accepted_terms' => (bool) $this->accepted_terms,
            'accepted_terms_at' => $this->accepted_terms_at?->toIso8601String(),
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'review_reason' => $this->review_reason,
            'documents' => IdentityDocumentResource::collection($this->whenLoaded('documents')),
        ];
    }
}
