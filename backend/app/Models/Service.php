<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Enums\ServiceGroup;
use Database\Factories\ServiceFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    /** @use HasFactory<ServiceFactory> */
    use HasFactory;

    protected $fillable = [
        'slug', 'title', 'summary', 'icon', 'image', 'group', 'features', 'process_steps', 'advantages',
        'body_markdown', 'status', 'sort_order', 'seo_title', 'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'group' => ServiceGroup::class,
            'status' => ContentStatus::class,
            'features' => 'array',
            'process_steps' => 'array',
            'advantages' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function scopePublished(Builder $query): void
    {
        $query->where('status', ContentStatus::Published->value);
    }

    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('id');
    }
}
