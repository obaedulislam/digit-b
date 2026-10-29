<?php

namespace Tests\Unit;

use App\Support\CsvExport;
use App\Support\Formatters;
use App\Support\QueryHelpers;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class SupportTest extends TestCase
{
    public function test_salary_display(): void
    {
        $this->assertSame('$85,000 – $90,000 / year', Formatters::salaryRange(85000, 90000, 'USD', 'year'));
        $this->assertSame('€4,500 / month', Formatters::salaryRange(4500, 4500, 'EUR', 'month'));
        $this->assertSame('From $50,000 / year', Formatters::salaryRange(50000, null, 'USD', 'year'));
        $this->assertSame('Up to £60,000 / year', Formatters::salaryRange(null, 60000, 'GBP', 'year'));
        $this->assertSame('BDT 30,000 – BDT 40,000 / year', Formatters::salaryRange(30000, 40000, 'BDT', 'year'));
        $this->assertNull(Formatters::salaryRange(null, null, 'USD', 'year'));
    }

    public function test_experience_display(): void
    {
        $this->assertSame('3–5 years', Formatters::experienceRange(3, 5));
        $this->assertSame('2 years', Formatters::experienceRange(2, 2));
        $this->assertSame('1 year', Formatters::experienceRange(1, 1));
        $this->assertSame('5+ years', Formatters::experienceRange(5, null));
        $this->assertNull(Formatters::experienceRange(null, null));
    }

    public function test_price_display_and_reading_time(): void
    {
        $this->assertSame('$9.82 per person / month', Formatters::price('9.82', 'USD', 'per person / month'));
        $this->assertSame('$9,500 per role / month', Formatters::price(9500, 'USD', 'per role / month'));
        $this->assertNull(Formatters::price(null, 'USD', null));
        $this->assertSame(1, Formatters::readingMinutes('short'));
        $this->assertSame(3, Formatters::readingMinutes(str_repeat('word ', 401)));
    }

    #[DataProvider('cells')]
    public function test_csv_cell_sanitising(mixed $input, mixed $expected): void
    {
        $this->assertSame($expected, CsvExport::cell($input));
    }

    /** @return array<string, array{mixed, mixed}> */
    public static function cells(): array
    {
        return [
            'equals' => ['=1+1', "'=1+1"],
            'plus' => ['+44 20', "'+44 20"],
            'minus' => ['-cmd', "'-cmd"],
            'at' => ['@SUM(1)', "'@SUM(1)"],
            'tab' => ["\tfoo", "'\tfoo"],
            'plain' => ['hello', 'hello'],
            'null' => [null, ''],
            'int stays numeric' => [-5, -5],
            'bool' => [true, 'yes'],
        ];
    }

    public function test_like_escaping(): void
    {
        $this->assertSame('%50\%\_off%', QueryHelpers::like('50%_off'));
    }
}
