<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'log_'.$this->uuid,
            'action' => $this->action,
            'actor' => $this->whenLoaded('actor', fn () => $this->actor ? [
                'id' => 'user_'.$this->actor->uuid,
                'name' => $this->actor->name,
            ] : null),
            'target_type' => $this->target_type,
            'target_id' => $this->target_id,
            'reason' => $this->reason,
            'metadata' => $this->metadata_json,
            'ip_address' => $this->ip_address,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
