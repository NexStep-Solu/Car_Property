<?php

namespace App\Enums;

enum CarStatus: string
{
    case Draft = 'draft';
    case PendingReview = 'pending_review';
    case ChangesRequested = 'changes_requested';
    case Published = 'published';
    case Rejected = 'rejected';
    case Sold = 'sold';
    case Archived = 'archived';
    case Suspended = 'suspended';
    case Expired = 'expired';
}
