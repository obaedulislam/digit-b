<?php

namespace App\Http\Requests\Admin;

use App\Enums\ContentStatus;
use App\Enums\PostType;
use Illuminate\Validation\Rule;

class PostRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $req = $this->req();

        return [
            'type' => [$req, Rule::in(PostType::values())],
            'title' => [$req, 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('posts', 'slug')->ignore($this->routeId())],
            'excerpt' => [$req, 'string', 'max:600'],
            'cover_image' => ['nullable', 'string', 'max:255'],
            'cover_image_alt' => ['nullable', 'string', 'max:255'],
            'body_markdown' => [$req, 'string', 'max:100000'],
            'post_category_id' => ['nullable', 'integer', Rule::exists('post_categories', 'id')],
            'author_name' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(ContentStatus::values())],
            'published_at' => ['nullable', 'date'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:320'],
        ];
    }
}
