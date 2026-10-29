<?php

namespace App\Http\Resources;

use App\Models\JobPosting;
use Illuminate\Http\Request;

/** @mixin JobPosting */
class JobDetailResource extends JobSummaryResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return parent::toArray($request) + [
            'description_markdown' => $this->description_markdown,
            'responsibilities' => $this->responsibilities ?? [],
            'requirements' => $this->requirements ?? [],
            'nice_to_have' => $this->nice_to_have ?? [],
            'benefits' => $this->benefits ?? [],
            'seo' => [
                'title' => $this->seo_title ?: $this->title,
                'description' => $this->seo_description ?: $this->summary,
                'og_image' => null,
            ],
            'related' => $this->when($this->relationLoaded('related'), fn () => JobSummaryResource::collection($this->related)),
        ];
    }
}
