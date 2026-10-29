<?php

namespace App\Support;

class Formatters
{
    private const SYMBOLS = ['USD' => '$', 'EUR' => '€', 'GBP' => '£', 'CAD' => 'CA$', 'AUD' => 'A$'];

    /** Formats a whole-unit amount, e.g. 85000 USD => "$85,000". */
    public static function money(int|float $amount, string $currency): string
    {
        $currency = strtoupper($currency);
        $decimals = floor($amount) == $amount ? 0 : 2;
        $number = number_format($amount, $decimals);

        return isset(self::SYMBOLS[$currency]) ? self::SYMBOLS[$currency].$number : $currency.' '.$number;
    }

    /** "$85,000 – $90,000 / year" (en dash). Returns null when nothing to show. */
    public static function salaryRange(?int $min, ?int $max, string $currency, string $period): ?string
    {
        if ($min === null && $max === null) {
            return null;
        }

        $suffix = ' / '.$period;

        if ($min !== null && $max !== null && $min !== $max) {
            return self::money($min, $currency).' – '.self::money($max, $currency).$suffix;
        }
        if ($min !== null && $max === null) {
            return 'From '.self::money($min, $currency).$suffix;
        }
        if ($min === null) {
            return 'Up to '.self::money($max, $currency).$suffix;
        }

        return self::money($min, $currency).$suffix;
    }

    /** "3–5 years", "2 years", "5+ years". */
    public static function experienceRange(?int $min, ?int $max): ?string
    {
        if ($min === null && $max === null) {
            return null;
        }
        if ($min !== null && $max !== null && $min !== $max) {
            return $min.'–'.$max.' years';
        }
        if ($min !== null && $max === null) {
            return $min.'+ years';
        }
        $value = $min ?? $max;

        return $value.' '.($value === 1 ? 'year' : 'years');
    }

    /** Price display for mentorship, e.g. "$9.82 per person / month". */
    public static function price(float|string|null $amount, string $currency, ?string $unit): ?string
    {
        if ($amount === null) {
            return null;
        }

        return trim(self::money((float) $amount, $currency).' '.($unit ?? ''));
    }

    /** Whole-minute reading time (200 wpm), at least 1. */
    public static function readingMinutes(?string $markdown): int
    {
        $words = str_word_count(strip_tags((string) $markdown));

        return max(1, (int) ceil($words / 200));
    }
}
