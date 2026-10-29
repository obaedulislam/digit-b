<?php

namespace App\Http\Requests\Admin;

use App\Enums\MentorshipTier;
use Illuminate\Validation\Rule;

class MentorshipProgramRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $req = $this->req();

        return [
            'name' => [$req, 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('mentorship_programs', 'slug')->ignore($this->routeId())],
            'tier' => [$req, Rule::in(MentorshipTier::values())],
            'audience' => ['sometimes', Rule::in(['individuals', 'employers'])],
            'summary' => [$req, 'string', 'max:600'],
            'price_amount' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'price_currency' => ['sometimes', 'string', 'size:3', 'alpha'],
            'price_unit_label' => ['nullable', 'string', 'max:60'],
            'features' => ['nullable', 'array', 'max:20'],
            'features.*' => ['string', 'max:255'],
            'is_featured' => ['sometimes', 'boolean'],
            'cta_label' => ['sometimes', 'string', 'max:60'],
            'is_published' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'between:0,65535'],
        ];
    }
}
