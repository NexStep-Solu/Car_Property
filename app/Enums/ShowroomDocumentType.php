<?php

namespace App\Enums;

enum ShowroomDocumentType: string
{
    case BusinessRegistration = 'business_registration';
    case RepresentativeId = 'representative_id';
    case TaxId = 'tax_id';
    case Other = 'other';
}
