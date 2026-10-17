<?php

namespace App\Models;

use App\Enums\ShowroomDocumentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ShowroomDocument extends Model
{
    use SoftDeletes;
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'showroom_application_id',
        'document_type',
        'storage_key',
        'original_filename',
        'mime_type',
        'file_size_bytes',
        'status',
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
            'status' => ShowroomDocumentStatus::class,
            'file_size_bytes' => 'integer',
            'reviewed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (ShowroomDocument $document) {
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
        return $this->belongsTo(ShowroomApplication::class, 'showroom_application_id');
    }

    /**
     * The reviewer who last reviewed the document.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
