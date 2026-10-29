<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CsvExport
{
    /**
     * Streams a CSV download, chunking the query so memory stays flat.
     *
     * @param  list<string>  $headings
     * @param  callable(mixed): list<mixed>  $row
     */
    public static function stream(string $filename, array $headings, Builder $query, callable $row): StreamedResponse
    {
        return response()->streamDownload(function () use ($headings, $query, $row) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel reads it correctly
            fputcsv($out, array_map([self::class, 'cell'], $headings), ',', '"', '\\');

            $query->chunkById(500, function ($rows) use ($out, $row) {
                foreach ($rows as $model) {
                    fputcsv($out, array_map([self::class, 'cell'], $row($model)), ',', '"', '\\');
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store',
        ]);
    }

    /** Neutralises spreadsheet formula injection in text cells. */
    public static function cell(mixed $value): string|int|float
    {
        if ($value === null) {
            return '';
        }
        if (is_bool($value)) {
            return $value ? 'yes' : 'no';
        }
        if (is_int($value) || is_float($value)) {
            return $value;
        }

        $value = (string) $value;
        if ($value !== '' && in_array($value[0], ['=', '+', '-', '@', "\t", "\r", "\n"], true)) {
            return "'".$value;
        }

        return $value;
    }
}
