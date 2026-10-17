<?php

namespace App\Enums;

enum InquiryStatus: string
{
    case New = 'new';
    case Read = 'read';
    case Replied = 'replied';
    case Contacted = 'contacted';
    case InDiscussion = 'in_discussion';
    case Closed = 'closed';
    case Spam = 'spam';
}
