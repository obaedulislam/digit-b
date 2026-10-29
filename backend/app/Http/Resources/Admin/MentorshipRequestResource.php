<?php

namespace App\Http\Resources\Admin;

use App\Models\MentorshipRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin MentorshipRequest */
class MentorshipRequestResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program' => $this->whenLoaded('program', fn () => [
                'id' => $this->program->id,
                'slug' => $this->program->slug,
                'name' => $this->program->name,
            ]),
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'current_role' => $this->current_role,
            'goal' => $this->goal,
            'status' => $this->status->value,
            'notes' => $this->notes,
            'consented_at' => $this->consented_at?->toIso8601ZuluString(),
            'created_at' => $this->created_at?->toIso8601ZuluString(),
            'updated_at' => $this->updated_at?->toIso8601ZuluString(),
        ];
    }
}
