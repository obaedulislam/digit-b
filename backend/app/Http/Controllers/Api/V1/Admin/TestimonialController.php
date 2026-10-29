<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\Admin\TestimonialRequest;
use App\Http\Resources\Admin\TestimonialResource;
use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class TestimonialController extends CrudController
{
    protected string $model = Testimonial::class;

    protected string $resource = TestimonialResource::class;

    protected string $requestClass = TestimonialRequest::class;

    protected array $sortable = ['id', 'name', 'rating', 'sort_order', 'is_published', 'created_at'];

    protected array $searchable = ['name', 'company', 'quote'];

    protected string $defaultSort = 'sort_order';

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($request->filled('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }
    }
}
