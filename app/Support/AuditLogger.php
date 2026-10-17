<?php

namespace App\Support;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

class AuditLogger
{
    /**
     * Write an audit log entry using the current request context.
     */
    public static function log(string $action, ?Model $target = null, ?string $reason = null, array $meta = []): void
    {
        AuditLog::create([
            'actor_user_id' => auth()->id(),
            'action' => $action,
            'target_type' => $target ? $target->getMorphClass() : null,
            'target_id' => $target ? (string) $target->getKey() : null,
            'reason' => $reason,
            'metadata_json' => $meta === [] ? null : $meta,
            'ip_address' => request()->ip(),
        ]);
    }
}
