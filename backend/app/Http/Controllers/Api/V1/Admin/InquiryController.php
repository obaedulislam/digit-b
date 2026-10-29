<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\Admin\InquiryUpdateRequest;
use App\Http\Resources\Admin\InquiryResource;
use App\Models\ContactInquiry;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/** Contact inquiries: list, view, update status/notes, delete (no create). */
class InquiryController extends CrudController
{
    protected string $model = ContactInquiry::class;

    protected string $resource = InquiryResource::class;

    protected string $requestClass = InquiryUpdateRequest::class;

    protected array $sortable = ['id', 'name', 'email', 'status', 'inquiry_type', 'created_at'];

    protected function applyFilters(Builder $query, Request $request): void
    {
        $query->filter($request->query());
    }
}
