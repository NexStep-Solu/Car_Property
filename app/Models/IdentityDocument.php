<?php

namespace App\Models;

use App\Enums\IdentityDocumentStatus;
use App\Enums\IdentityDocumentType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class IdentityDocument extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'seller_application_id',
        'document_type',
        'storage_key',
        'original_filename',
        'mime_type',
        'file_size_bytes',
        'document_status',
        'reviewed_by',
        'reviewed_at',
        'review_note',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'document_type' => IdentityDocumentType::class,
            'document_status' => IdentityDocumentStatus::class,
            'file_size_bytes' => 'integer',
            'reviewed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (IdentityDocument $document) {
            if (empty($document->uuid)) {
                $document->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * The application this document belongs to.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(SellerApplication::class, 'seller_application_id');
    }

    /**
     * The reviewer who last reviewed the document.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
