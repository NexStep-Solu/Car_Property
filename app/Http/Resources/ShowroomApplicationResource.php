<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShowroomApplicationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'showroom_app_'.$this->uuid,
            'showroom_id' => $this->whenLoaded(
                'showroom',
                fn () => $this->showroom ? 'showroom_'.$this->showroom->uuid : null
            ),
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'review_reason' => $this->review_reason,
            'documents' => ShowroomDocumentResource::collection($this->whenLoaded('documents')),
        ];
    }
}
