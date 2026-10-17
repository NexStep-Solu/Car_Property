<?php

namespace App\Enums;

enum ReportReason: string
{
    case Spam = 'spam';
    case Fraud = 'fraud';
    case WrongInfo = 'wrong_info';
    case Offensive = 'offensive';
    case Other = 'other';
}
