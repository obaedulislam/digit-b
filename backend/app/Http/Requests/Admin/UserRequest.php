<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class UserRequest extends AdminRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => mb_strtolower(trim($this->input('email')))]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $req = $this->req();

        return [
            'name' => [$req, 'string', 'max:255'],
            'email' => [$req, 'email:rfc', 'max:255', Rule::unique('users', 'email')->ignore($this->routeId())],
            'password' => [$this->isMethod('POST') ? 'required' : 'nullable', 'string', Password::min(10)->letters()->mixedCase()->numbers(), 'max:255'],
            'roles' => [$req, 'array', 'min:1'],
            'roles.*' => ['string', Rule::in(Role::query()->pluck('name')->all())],
        ];
    }
}
