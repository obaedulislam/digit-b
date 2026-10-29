<?php

namespace App\Http\Requests\Admin;

use App\Enums\FaqGroup;
use Illuminate\Validation\Rule;

class FaqRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $req = $this->req();

        return [
            'group' => [$req, Rule::in(FaqGroup::values())],
            'question' => [$req, 'string', 'max:255'],
            'answer' => [$req, 'string', 'max:4000'],
            'is_published' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'between:0,65535'],
        ];
    }
}
