<?php

namespace App\Observers;

use App\Models\ShowroomApplication;
use App\Support\AuditLogger;

class ShowroomApplicationObserver
{
    public function updating(ShowroomApplication $application): void
    {
        if (! $application->isDirty('status')) {
            return;
        }

        AuditLogger::log('showroom_application.status_changed', $application, $application->review_reason, [
            'from' => $application->getRawOriginal('status'),
            'to' => $application->status instanceof \BackedEnum ? $application->status->value : (string) $application->status,
        ]);
    }
}
