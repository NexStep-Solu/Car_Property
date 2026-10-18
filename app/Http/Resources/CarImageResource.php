<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CarImageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'img_'.$this->uuid,
            'uuid' => $this->uuid,
            'url' => $this->public_url ?? Storage::disk('public')->url($this->storage_key),
            'alt_text' => $this->alt_text,
            'sort_order' => (int) $this->sort_order,
            'is_primary' => (bool) $this->is_primary,
        ];
    }
}
