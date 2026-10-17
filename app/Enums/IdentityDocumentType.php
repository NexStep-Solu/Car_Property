<?php

namespace App\Enums;

enum IdentityDocumentType: string
{
    case Nrc = 'nrc';
    case Passport = 'passport';
    case OtherAcceptedId = 'other_accepted_id';
}
