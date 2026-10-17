<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CarCategoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'cat_'.$this->uuid,
            'name' => $this->name,
            'slug' => $this->slug,
            'icon_url' => $this->icon_storage_key
                ? Storage::disk('public')->url($this->icon_storage_key)
                : null,
        ];
    }
}
