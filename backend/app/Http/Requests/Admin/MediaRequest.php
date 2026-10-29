<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rules\File;

class MediaRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                File::types(['jpg', 'jpeg', 'png', 'webp', 'avif'])->max(config('digitb.media_max_kb', 4096)),
                'extensions:jpg,jpeg,png,webp,avif',
            ],
        ];
    }
}
