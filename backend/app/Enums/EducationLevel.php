<?php

namespace App\Enums;

enum EducationLevel: string
{
    case HighSchool = 'high_school';
    case Diploma = 'diploma';
    case Bachelor = 'bachelor';
    case Master = 'master';
    case Doctorate = 'doctorate';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::HighSchool => 'High school',
            self::Diploma => 'Diploma',
            self::Bachelor => "Bachelor's degree",
            self::Master => "Master's degree",
            self::Doctorate => 'Doctorate',
            self::Other => 'Other',
        };
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
