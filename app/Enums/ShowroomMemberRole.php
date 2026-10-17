<?php

namespace App\Enums;

enum ShowroomMemberRole: string
{
    case Owner = 'owner';
    case Manager = 'manager';
    case Staff = 'staff';
}
