<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ContentStatus;
use App\Enums\ServiceGroup;
use App\Http\Requests\Admin\ServiceRequest;
use App\Http\Resources\Admin\ServiceResource;
use App\Models\Service;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ServiceController extends CrudController
{
    protected string $model = Service::class;

    protected string $resource = ServiceResource::class;

    protected string $requestClass = ServiceRequest::class;

    protected array $sortable = ['id', 'title', 'group', 'status', 'sort_order', 'created_at'];

    protected array $searchable = ['title', 'slug', 'summary'];

    protected string $defaultSort = 'sort_order';

    protected ?string $slugSource = 'title';

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($group = ServiceGroup::tryFrom((string) $request->query('group'))) {
            $query->where('group', $group->value);
        }
        if ($status = ContentStatus::tryFrom((string) $request->query('status'))) {
            $query->where('status', $status->value);
        }
    }
}
