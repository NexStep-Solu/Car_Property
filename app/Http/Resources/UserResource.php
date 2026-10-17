<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'user_'.$this->uuid,
            'name' => $this->name,
            'display_name' => $this->sellerProfile?->display_name ?? $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'account_status' => $this->account_status,
            'preferred_language' => $this->preferred_language,
            'is_admin_account' => (bool) $this->is_admin_account,
            'is_verified_seller' => $this->sellerProfile?->verification_status?->value === 'approved',
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->pluck('name')),
            'seller_profile' => $this->whenLoaded('sellerProfile'),
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
