<?php

namespace App\Http\Requests\Admin;

class TestimonialRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $req = $this->req();

        return [
            'name' => [$req, 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'quote' => [$req, 'string', 'max:1500'],
            'rating' => ['sometimes', 'integer', 'between:1,5'],
            'avatar' => ['nullable', 'string', 'max:255'],
            'is_published' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'between:0,65535'],
        ];
    }
}
