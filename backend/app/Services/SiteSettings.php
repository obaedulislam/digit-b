<?php

namespace App\Services;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;

/**
 * Typed access to the `site_settings` key/value table.
 *
 * Settings are stored one row per (group, key) with a JSON value. Missing rows
 * fall back to the defaults below so the public endpoint never returns a hole.
 */
class SiteSettings
{
    public const CACHE_KEY = 'site_settings.all';

    public const GROUPS = ['company', 'contact', 'social', 'stats', 'seo'];

    /** @return array<string, mixed> */
    public static function defaults(): array
    {
        return [
            'company' => [
                'name' => 'DIGIT-B',
                'tagline' => 'Moving Beyond 0 and 1 to B-coming Digital',
                'description' => 'DIGIT-B is a recruitment firm for headhunting and talent acquisition in retail supply chain technology.',
            ],
            'contact' => [
                'email' => 'contact@digit-b.com',
                'phone' => '+1 (352) 256-9875',
                'address_lines' => ['Columbus, Ohio', 'United States'],
                'hours' => [
                    ['days' => 'Mon–Sat', 'time' => '10:00 – 18:00'],
                    ['days' => 'Sunday', 'time' => 'Closed'],
                ],
                'map_url' => null,
            ],
            'social' => [
                'linkedin' => null,
                'facebook' => null,
                'x' => null,
                'instagram' => null,
            ],
            'stats' => [],
            'seo' => [
                'site_title' => 'DIGIT-B | Retail Supply Chain Tech Recruitment',
                'default_description' => null,
                'og_image' => null,
            ],
        ];
    }

    /** @return array<string, mixed> */
    public function all(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            $stored = SiteSetting::query()->get()->groupBy('group');
            $result = self::defaults();

            foreach (self::GROUPS as $group) {
                $rows = $stored->get($group);
                if ($rows === null) {
                    continue;
                }
                if ($group === 'stats') {
                    $items = $rows->firstWhere('key', 'items');
                    $result['stats'] = $items?->value ?? [];

                    continue;
                }
                foreach ($rows as $row) {
                    $result[$group][$row->key] = $row->value;
                }
            }

            return $result;
        });
    }

    public function get(string $group, string $key, mixed $default = null): mixed
    {
        return $this->all()[$group][$key] ?? $default;
    }

    /**
     * Persist one or more groups. `stats` is a list; others are key => value maps.
     *
     * @param  array<string, mixed>  $groups
     */
    public function update(array $groups): void
    {
        foreach ($groups as $group => $values) {
            if (! in_array($group, self::GROUPS, true)) {
                continue;
            }

            if ($group === 'stats') {
                $this->store('stats', 'items', array_values($values));

                continue;
            }

            foreach ($values as $key => $value) {
                $this->store($group, $key, $value);
            }
        }

        Cache::forget(self::CACHE_KEY);
    }

    private function store(string $group, string $key, mixed $value): void
    {
        SiteSetting::query()->updateOrCreate(['group' => $group, 'key' => $key], ['value' => $value]);
    }

    public function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
