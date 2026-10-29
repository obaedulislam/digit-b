<?php

namespace App\Enums;

enum MentorshipTier: string
{
    case Standard = 'standard';
    case Premium = 'premium';

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
