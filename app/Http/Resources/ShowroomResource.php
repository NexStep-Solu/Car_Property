<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ShowroomResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'showroom_'.$this->uuid,
            'business_name' => $this->business_name,
            'slug' => $this->slug,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'region' => $this->region,
            'logo_url' => $this->logo_storage_key ? Storage::disk('public')->url($this->logo_storage_key) : null,
            'verification_status' => $this->verification_status instanceof \BackedEnum ? $this->verification_status->value : $this->verification_status,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'description' => $this->description,
        ];
    }
}
