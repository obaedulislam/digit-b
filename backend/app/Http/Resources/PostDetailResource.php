<?php

namespace App\Http\Resources;

use App\Models\Post;
use Illuminate\Http\Request;

/** @mixin Post */
class PostDetailResource extends PostSummaryResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return parent::toArray($request) + [
            'body_markdown' => $this->body_markdown,
            'seo' => [
                'title' => $this->seo_title ?: $this->title,
                'description' => $this->seo_description ?: $this->excerpt,
                'og_image' => $this->cover_image,
            ],
            'related' => $this->when($this->relationLoaded('related'), fn () => PostSummaryResource::collection($this->related)),
        ];
    }
}
