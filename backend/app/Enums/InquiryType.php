<?php

namespace App\Enums;

enum InquiryType: string
{
    case Hiring = 'hiring';
    case Candidate = 'candidate';
    case Mentorship = 'mentorship';
    case Partnership = 'partnership';
    case General = 'general';

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
