<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\PostType;
use App\Http\Requests\Admin\PostCategoryRequest;
use App\Http\Resources\Admin\PostCategoryResource;
use App\Models\PostCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class PostCategoryController extends CrudController
{
    protected string $model = PostCategory::class;

    protected string $resource = PostCategoryResource::class;

    protected string $requestClass = PostCategoryRequest::class;

    protected array $sortable = ['id', 'name', 'slug', 'type', 'created_at', 'posts_count'];

    protected array $searchable = ['name', 'slug'];

    protected array $withCount = ['posts'];

    protected string $defaultSort = 'name';

    protected ?string $slugSource = 'name';

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($type = PostType::tryFrom((string) $request->query('type'))) {
            $query->where('type', $type->value);
        }
    }
}
