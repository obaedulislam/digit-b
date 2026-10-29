<?php

namespace App\Http\Resources\Admin;

use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Application */
class ApplicationResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'work_status' => $this->work_status->value,
            'applicant' => $this->whenLoaded('applicant', fn () => [
                'id' => $this->applicant->id,
                'first_name' => $this->applicant->first_name,
                'last_name' => $this->applicant->last_name,
                'full_name' => $this->applicant->full_name,
                'email' => $this->applicant->email,
                'phone' => $this->applicant->phone,
                'location' => $this->applicant->location,
                'current_title' => $this->applicant->current_title,
                'years_experience' => $this->applicant->years_experience,
            ]),
            'job' => $this->whenLoaded('job', fn () => $this->job ? [
                'id' => $this->job->id,
                'slug' => $this->job->slug,
                'title' => $this->job->title,
                'reference_code' => $this->job->reference_code,
            ] : null),
            'has_resume' => $this->resume_path !== null,
            'created_at' => $this->created_at?->toIso8601ZuluString(),
            'updated_at' => $this->updated_at?->toIso8601ZuluString(),
        ];
    }
}
