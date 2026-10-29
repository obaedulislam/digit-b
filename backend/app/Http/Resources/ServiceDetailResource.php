<?php

namespace App\Http\Resources;

use App\Models\Service;
use Illuminate\Http\Request;

/** @mixin Service */
class ServiceDetailResource extends ServiceResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return parent::toArray($request) + [
            'body_markdown' => $this->body_markdown,
            'process_steps' => $this->process_steps ?? [],
            'advantages' => $this->advantages ?? [],
            'seo' => [
                'title' => $this->seo_title ?: $this->title,
                'description' => $this->seo_description ?: $this->summary,
                'og_image' => $this->image,
            ],
        ];
    }
}
