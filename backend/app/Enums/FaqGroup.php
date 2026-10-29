<?php

namespace App\Enums;

enum FaqGroup: string
{
    case About = 'about';
    case Employers = 'employers';
    case Candidates = 'candidates';

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
