<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IdentityDocumentResource extends JsonResource
{
    /**
     * NOTE: storage_key is never exposed.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => 'identity_doc_'.$this->uuid,
            'document_type' => $this->document_type instanceof \BackedEnum ? $this->document_type->value : $this->document_type,
            'original_filename' => $this->original_filename,
            'mime_type' => $this->mime_type,
            'file_size_bytes' => (int) $this->file_size_bytes,
            'document_status' => $this->document_status instanceof \BackedEnum ? $this->document_status->value : $this->document_status,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'review_note' => $this->review_note,
        ];
    }
}
