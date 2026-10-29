<?php

namespace App\Http\Resources\Admin;

use App\Models\JobPosting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin JobPosting */
class JobResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'reference_code' => $this->reference_code,
            'employment_type' => $this->employment_type->value,
            'employment_type_label' => $this->employment_type->label(),
            'work_mode' => $this->work_mode->value,
            'work_mode_label' => $this->work_mode->label(),
            'location' => $this->location,
            'country' => $this->country,
            'department' => $this->department,
            'salary_min' => $this->salary_min,
            'salary_max' => $this->salary_max,
            'salary_currency' => $this->salary_currency,
            'salary_period' => $this->salary_period->value,
            'show_salary' => $this->show_salary,
            'salary_display' => $this->salaryDisplay(),
            'experience_min' => $this->experience_min,
            'experience_max' => $this->experience_max,
            'experience_display' => $this->experienceDisplay(),
            'status' => $this->status->value,
            'is_published' => $this->status->value === 'published',
            'closes_at' => $this->closes_at?->toIso8601ZuluString(),
            'published_at' => $this->published_at?->toIso8601ZuluString(),
            'is_featured' => $this->is_featured,
            'summary' => $this->summary,
            'description_markdown' => $this->description_markdown,
            'responsibilities' => $this->responsibilities ?? [],
            'requirements' => $this->requirements ?? [],
            'nice_to_have' => $this->nice_to_have ?? [],
            'benefits' => $this->benefits ?? [],
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'applications_count' => $this->whenCounted('applications'),
            'created_at' => $this->created_at?->toIso8601ZuluString(),
            'updated_at' => $this->updated_at?->toIso8601ZuluString(),
        ];
    }
}
