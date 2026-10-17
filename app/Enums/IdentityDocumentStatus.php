<?php

namespace App\Enums;

enum IdentityDocumentStatus: string
{
    case Uploaded = 'uploaded';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case ReplacementRequested = 'replacement_requested';
}
