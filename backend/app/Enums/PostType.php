<?php

namespace App\Enums;

enum PostType: string
{
    case Article = 'article';
    case Blog = 'blog';

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
