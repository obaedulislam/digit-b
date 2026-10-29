<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\EmploymentType;
use App\Enums\JobStatus;
use App\Enums\WorkMode;
use App\Http\Requests\Admin\JobRequest;
use App\Http\Resources\Admin\JobResource;
use App\Models\JobPosting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobController extends CrudController
{
    protected string $model = JobPosting::class;

    protected string $resource = JobResource::class;

    protected string $requestClass = JobRequest::class;

    protected array $sortable = ['id', 'title', 'status', 'employment_type', 'location', 'published_at', 'closes_at', 'created_at', 'applications_count'];

    protected array $searchable = ['title', 'slug', 'reference_code', 'department', 'location'];

    protected array $withCount = ['applications'];

    protected ?string $slugSource = 'title';

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($status = JobStatus::tryFrom((string) $request->query('status'))) {
            $query->where('status', $status->value);
        }
        if ($type = EmploymentType::tryFrom((string) $request->query('employment_type'))) {
            $query->where('employment_type', $type->value);
        }
        if ($mode = WorkMode::tryFrom((string) $request->query('work_mode'))) {
            $query->where('work_mode', $mode->value);
        }
        if ($request->filled('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }
    }

    protected function prepare(array $data, ?Model $existing): array
    {
        $data = parent::prepare($data, $existing);

        $status = $data['status'] ?? $existing?->status->value;
        $publishedAt = array_key_exists('published_at', $data) ? $data['published_at'] : $existing?->published_at;
        if ($status === JobStatus::Published->value && blank($publishedAt)) {
            $data['published_at'] = now();
        }

        return $data;
    }

    public function duplicate(string $id): JsonResponse
    {
        /** @var JobPosting $source */
        $source = JobPosting::query()->findOrFail($id);

        $copy = $source->replicate(['reference_code', 'published_at', 'closes_at']);
        $copy->title = $source->title.' (Copy)';
        $copy->slug = $this->uniqueSlug($source->slug.'-copy');
        $copy->status = JobStatus::Draft;
        $copy->is_featured = false;
        $copy->save();

        return (new JobResource($copy->loadCount('applications')))->response()->setStatusCode(201);
    }
}
