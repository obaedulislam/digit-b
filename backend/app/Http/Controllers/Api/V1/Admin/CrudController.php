<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Support\QueryHelpers;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

/**
 * Generic admin CRUD. Concrete controllers only declare configuration
 * (model, resource, request, sortable/searchable columns) and optional hooks.
 * Access control is enforced by `can:` route middleware.
 */
abstract class CrudController extends Controller
{
    /** @var class-string<Model> */
    protected string $model;

    /** @var class-string<JsonResource> */
    protected string $resource;

    /** @var class-string<FormRequest> */
    protected string $requestClass;

    /** @var list<string> */
    protected array $sortable = ['id', 'created_at'];

    /** @var list<string> */
    protected array $searchable = [];

    protected string $defaultSort = '-id';

    /** @var list<string> */
    protected array $with = [];

    /** @var list<string> */
    protected array $withCount = [];

    /** Request field the slug is derived from when none is given (e.g. "title"). */
    protected ?string $slugSource = null;

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = $this->newQuery();

        $this->applyFilters($query, $request);
        QueryHelpers::search($query, $request->query('search'), $this->searchable);
        QueryHelpers::sort($query, $request->query('sort'), $this->sortable, $this->defaultSort);

        return $this->resource::collection(
            $query->paginate(QueryHelpers::perPage($request))->withQueryString()
        );
    }

    public function show(string $id): JsonResource
    {
        return new $this->resource($this->find($id));
    }

    public function store(): JsonResponse
    {
        $data = $this->prepare(app($this->requestClass)->validated(), null);

        $model = $this->model::query()->create($data);
        $this->saved($model, true);

        return (new $this->resource($this->find((string) $model->getKey())))
            ->response()->setStatusCode(201);
    }

    public function update(string $id): JsonResource
    {
        $model = $this->find($id);
        $data = $this->prepare(app($this->requestClass)->validated(), $model);

        $model->fill($data)->save();
        $this->saved($model, false);

        return new $this->resource($this->find($id));
    }

    public function destroy(string $id): Response
    {
        $model = $this->find($id);
        $this->beforeDelete($model);
        $model->delete();

        return response()->noContent();
    }

    protected function newQuery(): Builder
    {
        return $this->model::query()->with($this->with)->withCount($this->withCount);
    }

    protected function find(string $id): Model
    {
        return $this->newQuery()->findOrFail($id);
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        //
    }

    /**
     * Adjust validated data before persisting.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function prepare(array $data, ?Model $existing): array
    {
        if ($this->slugSource !== null && $existing === null && blank($data['slug'] ?? null)) {
            $data['slug'] = $this->uniqueSlug((string) ($data[$this->slugSource] ?? ''));
        }

        return $data;
    }

    protected function saved(Model $model, bool $created): void
    {
        //
    }

    protected function beforeDelete(Model $model): void
    {
        //
    }

    protected function uniqueSlug(string $source): string
    {
        $base = Str::slug($source) ?: 'item';
        $slug = $base;
        $i = 2;

        while ($this->model::query()->withoutGlobalScopes()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
