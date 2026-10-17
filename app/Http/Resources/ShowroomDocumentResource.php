<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShowroomDocumentResource extends JsonResource
{
    /**
     * NOTE: storage_key is never exposed.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'showroom_doc_'.$this->uuid,
            'document_type' => $this->document_type instanceof \BackedEnum ? $this->document_type->value : $this->document_type,
            'original_filename' => $this->original_filename,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
        ];
    }
}
