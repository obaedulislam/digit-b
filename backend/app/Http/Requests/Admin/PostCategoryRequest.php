<?php

namespace App\Http\Requests\Admin;

use App\Enums\PostType;
use Illuminate\Validation\Rule;

class PostCategoryRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => [$this->req(), 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('post_categories', 'slug')->ignore($this->routeId())],
            'type' => ['nullable', Rule::in(PostType::values())],
        ];
    }
}
