<?php

namespace App\Enums;

enum ShowroomDocumentStatus: string
{
    case Uploaded = 'uploaded';
    case UnderReview = 'under_review';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
