<?php

namespace App\Http\Requests\Admin;

use App\Enums\ContentStatus;
use App\Enums\ServiceGroup;
use Illuminate\Validation\Rule;

class ServiceRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $req = $this->req();

        return [
            'title' => [$req, 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('services', 'slug')->ignore($this->routeId())],
            'summary' => [$req, 'string', 'max:600'],
            'icon' => ['nullable', 'string', 'max:60'],
            'image' => ['nullable', 'string', 'max:255'],
            'group' => [$req, Rule::in(ServiceGroup::values())],
            'features' => ['nullable', 'array', 'max:20'],
            'features.*' => ['string', 'max:255'],
            'process_steps' => ['nullable', 'array', 'max:12'],
            'process_steps.*.title' => ['required', 'string', 'max:255'],
            'process_steps.*.description' => ['required', 'string', 'max:1000'],
            'advantages' => ['nullable', 'array', 'max:12'],
            'advantages.*.title' => ['required', 'string', 'max:255'],
            'advantages.*.description' => ['required', 'string', 'max:1000'],
            'body_markdown' => ['nullable', 'string', 'max:100000'],
            'status' => ['sometimes', Rule::in(ContentStatus::values())],
            'sort_order' => ['sometimes', 'integer', 'between:0,65535'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:320'],
        ];
    }
}
