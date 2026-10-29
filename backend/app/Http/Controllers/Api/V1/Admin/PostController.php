<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ContentStatus;
use App\Http\Requests\Admin\PostRequest;
use App\Http\Resources\Admin\PostResource;
use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class PostController extends CrudController
{
    protected string $model = Post::class;

    protected string $resource = PostResource::class;

    protected string $requestClass = PostRequest::class;

    protected array $sortable = ['id', 'title', 'type', 'status', 'published_at', 'created_at', 'reading_minutes'];

    protected array $searchable = ['title', 'slug', 'excerpt'];

    protected array $with = ['category', 'author'];

    protected ?string $slugSource = 'title';

    protected function applyFilters(Builder $query, Request $request): void
    {
        $query->filter($request->query());

        if ($status = ContentStatus::tryFrom((string) $request->query('status'))) {
            $query->where('status', $status->value);
        }
    }

    protected function prepare(array $data, ?Model $existing): array
    {
        $data = parent::prepare($data, $existing);

        if ($existing === null) {
            $data['author_id'] = request()->user()?->id;
        }

        return $data;
    }
}
