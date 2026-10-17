<?php

namespace App\Enums;

enum PreferredContactMethod: string
{
    case Phone = 'phone';
    case Email = 'email';
    case Chat = 'chat';
    case InApp = 'in_app';
}
