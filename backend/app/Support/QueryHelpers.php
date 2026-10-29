<?php

namespace App\Support;

use Illuminate\Contracts\Database\Eloquent\Builder as BuilderContract;
use Illuminate\Http\Request;

class QueryHelpers
{
    /** Escapes LIKE wildcards in user input. */
    public static function like(string $term): string
    {
        return '%'.addcslashes(trim($term), '%_\\').'%';
    }

    /**
     * Applies a case-insensitive "contains" search over the given columns.
     * Column names come from code (never from the request).
     *
     * @param  list<string>  $columns
     */
    public static function search(BuilderContract $query, ?string $term, array $columns): void
    {
        $term = trim((string) $term);
        if ($term === '' || $columns === []) {
            return;
        }

        $like = self::like(mb_substr($term, 0, 100));
        $query->where(function ($q) use ($columns, $like) {
            foreach ($columns as $column) {
                $q->orWhere($column, 'like', $like);
            }
        });
    }

    /**
     * Applies `?sort=field` / `?sort=-field` limited to an allow-list.
     *
     * @param  list<string>  $allowed
     */
    public static function sort(BuilderContract $query, ?string $sort, array $allowed, string $default = '-id'): void
    {
        $sort = (string) $sort;
        $field = ltrim($sort, '-');

        if (! in_array($field, $allowed, true)) {
            $sort = $default;
            $field = ltrim($default, '-');
        }

        $query->orderBy($field, str_starts_with($sort, '-') ? 'desc' : 'asc');

        if ($field !== 'id') {
            $query->orderBy('id', 'desc');
        }
    }

    public static function perPage(Request $request, int $default = 12, int $max = 50): int
    {
        return max(1, min($max, (int) $request->query('per_page', $default)));
    }
}
