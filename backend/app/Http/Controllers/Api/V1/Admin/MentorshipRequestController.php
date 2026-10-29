<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\Admin\InquiryUpdateRequest;
use App\Http\Resources\Admin\MentorshipRequestResource;
use App\Models\MentorshipRequest;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class MentorshipRequestController extends CrudController
{
    protected string $model = MentorshipRequest::class;

    protected string $resource = MentorshipRequestResource::class;

    protected string $requestClass = InquiryUpdateRequest::class;

    protected array $sortable = ['id', 'name', 'email', 'status', 'created_at'];

    protected array $with = ['program'];

    protected function applyFilters(Builder $query, Request $request): void
    {
        $query->filter($request->query());
    }
}
