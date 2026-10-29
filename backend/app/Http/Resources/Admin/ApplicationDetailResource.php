<?php

namespace App\Http\Resources\Admin;

use App\Models\Application;
use Illuminate\Http\Request;

/** @mixin Application */
class ApplicationDetailResource extends ApplicationResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $base = parent::toArray($request);

        // Replace the compact applicant block with the full profile.
        $base['applicant'] = $this->whenLoaded('applicant', fn () => [
            'id' => $this->applicant->id,
            'first_name' => $this->applicant->first_name,
            'last_name' => $this->applicant->last_name,
            'full_name' => $this->applicant->full_name,
            'email' => $this->applicant->email,
            'phone' => $this->applicant->phone,
            'location' => $this->applicant->location,
            'linkedin_url' => $this->applicant->linkedin_url,
            'current_title' => $this->applicant->current_title,
            'current_company' => $this->applicant->current_company,
            'years_experience' => $this->applicant->years_experience,
            'highest_education' => $this->applicant->highest_education,
            'skills' => $this->applicant->skills ?? [],
        ]);

        return $base + [
            'expected_salary' => $this->expected_salary,
            'available_from' => $this->available_from?->toDateString(),
            'cover_letter' => $this->cover_letter,
            'notes' => $this->notes,
            'consented_at' => $this->consented_at?->toIso8601ZuluString(),
            'resume' => [
                'original_name' => $this->resume_original_name,
                'mime' => $this->resume_mime,
                'size' => $this->resume_size,
                'download_url' => '/api/v1/admin/applications/'.$this->id.'/resume',
            ],
            'events' => $this->whenLoaded('events', fn () => $this->events->map(fn ($event) => [
                'id' => $event->id,
                'type' => $event->type,
                'from_status' => $event->from_status,
                'to_status' => $event->to_status,
                'note' => $event->note,
                'user' => $event->user ? ['id' => $event->user->id, 'name' => $event->user->name] : null,
                'created_at' => $event->created_at?->toIso8601ZuluString(),
            ])->values()),
        ];
    }
}
