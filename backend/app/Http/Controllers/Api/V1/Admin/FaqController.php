<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\FaqGroup;
use App\Http\Requests\Admin\FaqRequest;
use App\Http\Resources\Admin\FaqResource;
use App\Models\Faq;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class FaqController extends CrudController
{
    protected string $model = Faq::class;

    protected string $resource = FaqResource::class;

    protected string $requestClass = FaqRequest::class;

    protected array $sortable = ['id', 'group', 'question', 'sort_order', 'is_published', 'created_at'];

    protected array $searchable = ['question', 'answer'];

    protected string $defaultSort = 'sort_order';

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($group = FaqGroup::tryFrom((string) $request->query('group'))) {
            $query->where('group', $group->value);
        }
        if ($request->filled('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }
    }
}
