<?php

namespace App\Http\Resources\Admin;

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
            'price_amount' => $this->price_amount !== null ? (float) $this->price_amount : null,
            'price_currency' => $this->price_currency,
            'price_unit_label' => $this->price_unit_label,
            'price_display' => $this->priceDisplay(),
            'features' => $this->features ?? [],
            'is_featured' => $this->is_featured,
            'cta_label' => $this->cta_label,
            'is_published' => $this->is_published,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at?->toIso8601ZuluString(),
            'updated_at' => $this->updated_at?->toIso8601ZuluString(),
        ];
    }
}
