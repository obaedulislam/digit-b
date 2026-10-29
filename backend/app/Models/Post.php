<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Enums\PostType;
use App\Support\Formatters;
use App\Support\QueryHelpers;
use Database\Factories\PostFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    /** @use HasFactory<PostFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'type', 'post_category_id', 'author_id', 'author_name', 'slug', 'title', 'excerpt', 'cover_image',
        'cover_image_alt', 'body_markdown', 'status', 'published_at', 'seo_title', 'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'type' => PostType::class,
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
            'reading_minutes' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Post $post) {
            $post->reading_minutes = Formatters::readingMinutes($post->body_markdown);
            if ($post->status === ContentStatus::Published && $post->published_at === null) {
                $post->published_at = now();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(PostCategory::class, 'post_category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function scopePublished(Builder $query): void
    {
        $query->where('status', ContentStatus::Published->value)
            ->where(fn (Builder $q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
    }

    public function scopeFilter(Builder $query, array $params): void
    {
        QueryHelpers::search($query, $params['search'] ?? null, ['title', 'excerpt']);

        if ($type = PostType::tryFrom((string) ($params['type'] ?? ''))) {
            $query->where('type', $type->value);
        }
        if (filled($params['category'] ?? null)) {
            $query->whereHas('category', fn (Builder $q) => $q->where('post_categories.slug', (string) $params['category']));
        }
    }

    public function authorDisplayName(): string
    {
        return $this->author_name ?: ($this->author?->name ?? 'DIGIT-B Editorial Team');
    }
}
