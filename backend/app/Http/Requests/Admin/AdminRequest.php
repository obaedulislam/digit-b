<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Base for admin create/update requests. Authorization is enforced by route
 * permission middleware, so requests simply pass through here.
 */
abstract class AdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** `required` when creating, `sometimes` for partial updates (PATCH/PUT). */
    protected function req(): string
    {
        return $this->isMethod('POST') ? 'required' : 'sometimes';
    }

    /** Id of the record being updated (route parameter is positional by apiResource). */
    protected function routeId(): ?int
    {
        $parameters = $this->route()?->parameters() ?? [];
        $id = reset($parameters);

        return is_numeric($id) ? (int) $id : null;
    }
}
