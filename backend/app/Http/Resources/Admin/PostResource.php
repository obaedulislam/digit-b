<?php

namespace App\Http\Resources\Admin;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Post */
class PostResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'slug' => $this->slug,
            'title' => $this->title,
            'excerpt' => $this->excerpt,
            'cover_image' => $this->cover_image,
            'cover_image_alt' => $this->cover_image_alt,
            'body_markdown' => $this->body_markdown,
            'status' => $this->status->value,
            'is_published' => $this->status->value === 'published',
            'published_at' => $this->published_at?->toIso8601ZuluString(),
            'reading_minutes' => $this->reading_minutes,
            'post_category_id' => $this->post_category_id,
            'category' => $this->whenLoaded('category', fn () => $this->category
                ? ['id' => $this->category->id, 'slug' => $this->category->slug, 'name' => $this->category->name]
                : null),
            'author_id' => $this->author_id,
            'author_name' => $this->authorDisplayName(),
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'created_at' => $this->created_at?->toIso8601ZuluString(),
            'updated_at' => $this->updated_at?->toIso8601ZuluString(),
        ];
    }
}
