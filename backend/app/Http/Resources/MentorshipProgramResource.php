<?php

namespace App\Http\Resources;

use App\Models\MentorshipProgram;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin MentorshipProgram */
class MentorshipProgramResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'tier' => $this->tier->value,
            'audience' => $this->audience,
            'summary' => $this->summary,
            'price' => $this->price_amount !== null ? [
                'amount' => (float) $this->price_amount,
                'currency' => $this->price_currency,
                'unit_label' => $this->price_unit_label,
                'display' => $this->priceDisplay(),
            ] : null,
            'features' => $this->features ?? [],
            'is_featured' => $this->is_featured,
            'cta_label' => $this->cta_label,
        ];
    }
}
