<?php

namespace App\Enums;

enum ServiceGroup: string
{
    case Solution = 'solution';
    case HiringModel = 'hiring_model';

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
