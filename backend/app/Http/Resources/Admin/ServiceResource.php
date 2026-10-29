<?php

namespace App\Http\Resources\Admin;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Service */
class ServiceResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'summary' => $this->summary,
            'icon' => $this->icon,
            'image' => $this->image,
            'group' => $this->group->value,
            'features' => $this->features ?? [],
            'process_steps' => $this->process_steps ?? [],
            'advantages' => $this->advantages ?? [],
            'body_markdown' => $this->body_markdown,
            'status' => $this->status->value,
            'is_published' => $this->status->value === 'published',
            'sort_order' => $this->sort_order,
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'created_at' => $this->created_at?->toIso8601ZuluString(),
            'updated_at' => $this->updated_at?->toIso8601ZuluString(),
        ];
    }
}
