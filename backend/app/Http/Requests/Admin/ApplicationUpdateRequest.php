<?php

namespace App\Http\Requests\Admin;

use App\Enums\ApplicationStatus;
use Illuminate\Validation\Rule;

class ApplicationUpdateRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::in(ApplicationStatus::values())],
            'notes' => ['sometimes', 'nullable', 'string', 'max:4000'],
        ];
    }
}
