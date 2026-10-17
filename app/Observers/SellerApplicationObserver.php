<?php

namespace App\Observers;

use App\Models\SellerApplication;
use App\Support\AuditLogger;

class SellerApplicationObserver
{
    public function updating(SellerApplication $application): void
    {
        if (! $application->isDirty('status')) {
            return;
        }

        AuditLogger::log('seller_application.status_changed', $application, $application->review_reason, [
            'from' => $application->getRawOriginal('status'),
            'to' => $application->status instanceof \BackedEnum ? $application->status->value : (string) $application->status,
        ]);
    }
}
