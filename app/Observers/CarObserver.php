<?php

namespace App\Observers;

use App\Enums\CarStatus;
use App\Models\Car;
use App\Support\AuditLogger;
use BackedEnum;

class CarObserver
{
    /**
     * Transient reason for the change (set by callers before update).
     * Eloquent would otherwise treat it as an attribute.
     */
    public static function setChangeReason(Car $car, ?string $reason): void
    {
        $car->status_change_reason = $reason;
    }

    public function updating(Car $car): void
    {
        if (! $car->isDirty('status')) {
            return;
        }

        $from = $car->getRawOriginal('status');
        $to = $car->status instanceof BackedEnum ? $car->status->value : (string) $car->status;

        $car->statusHistory()->create([
            'from_status' => $from,
            'to_status' => $to,
            'changed_by' => auth()->id(),
            'reason' => $car->status_change_reason ?? null,
        ]);

        AuditLogger::log('car.status_changed', $car, $car->status_change_reason, [
            'from' => $from,
            'to' => $to,
        ]);
    }
}
