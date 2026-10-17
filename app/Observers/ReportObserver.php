<?php

namespace App\Observers;

use App\Enums\ReportStatus;
use App\Models\Report;
use App\Support\AuditLogger;

class ReportObserver
{
    public function updating(Report $report): void
    {
        if (! $report->isDirty('status')) {
            return;
        }

        $to = $report->status instanceof \BackedEnum ? $report->status->value : (string) $report->status;

        if (in_array($to, [ReportStatus::Resolved->value, ReportStatus::Dismissed->value], true)) {
            $report->resolved_at ??= now();
        }

        AuditLogger::log('report.status_changed', $report, null, [
            'from' => $report->getRawOriginal('status'),
            'to' => $to,
        ]);
    }
}
