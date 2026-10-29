<?php

namespace App\Http\Requests\Admin;

use App\Enums\InquiryStatus;
use Illuminate\Validation\Rule;

/** Used for contact inquiries and mentorship requests (status + internal notes). */
class InquiryUpdateRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::in(InquiryStatus::values())],
            'notes' => ['sometimes', 'nullable', 'string', 'max:4000'],
        ];
    }
}
