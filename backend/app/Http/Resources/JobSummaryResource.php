<?php

namespace App\Http\Resources;

use App\Models\JobPosting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin JobPosting */
class JobSummaryResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $hasExperience = $this->experience_min !== null || $this->experience_max !== null;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'reference_code' => $this->reference_code,
            'summary' => $this->summary,
            'department' => $this->department,
            'employment_type' => $this->employment_type->value,
            'employment_type_label' => $this->employment_type->label(),
            'work_mode' => $this->work_mode->value,
            'work_mode_label' => $this->work_mode->label(),
            'location' => $this->location,
            'country' => $this->country,
            'salary' => $this->show_salary && ($this->salary_min !== null || $this->salary_max !== null) ? [
                'min' => $this->salary_min,
                'max' => $this->salary_max,
                'currency' => $this->salary_currency,
                'period' => $this->salary_period->value,
                'display' => $this->salaryDisplay(),
            ] : null,
            'experience' => $hasExperience ? [
                'min' => $this->experience_min,
                'max' => $this->experience_max,
                'display' => $this->experienceDisplay(),
            ] : null,
            'is_featured' => $this->is_featured,
            'published_at' => $this->published_at?->toIso8601ZuluString(),
            'closes_at' => $this->closes_at?->toIso8601ZuluString(),
        ];
    }
}
