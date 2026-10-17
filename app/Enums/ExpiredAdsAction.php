<?php

namespace App\Enums;

enum ExpiredAdsAction: string
{
    case Hide = 'hide';
    case KeepVisible = 'keep_visible';
    case Archive = 'archive';
}
