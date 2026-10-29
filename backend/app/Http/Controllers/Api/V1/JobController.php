<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\EmploymentType;
use App\Enums\WorkMode;
use App\Http\Controllers\Controller;
use App\Http\Resources\JobDetailResource;
use App\Http\Resources\JobSummaryResource;
use App\Models\JobPosting;
use App\Support\QueryHelpers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class JobController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $jobs = JobPosting::query()
            ->open()
            ->filter($request->query())
            ->sortBy($request->query('sort'))
            ->paginate(QueryHelpers::perPage($request))
            ->withQueryString();

        return JobSummaryResource::collection($jobs);
    }

    public function filters(): JsonResponse
    {
        // $column is always one of the literals below (never user input).
        $counts = fn (string $column) => JobPosting::query()->open()
            ->whereNotNull($column)
            ->selectRaw("{$column} as value, count(*) as total")
            ->groupBy($column)
            ->orderBy($column)
            ->get();

        $options = fn ($rows, callable $label) => $rows
            ->map(fn ($row) => ['value' => $row->value, 'label' => $label($row->value), 'count' => (int) $row->total])
            ->values();

        return response()->json(['data' => [
            'employment_types' => $options($counts('employment_type'), fn ($v) => EmploymentType::from($v)->label()),
            'work_modes' => $options($counts('work_mode'), fn ($v) => WorkMode::from($v)->label()),
            'locations' => $options($counts('location'), fn ($v) => $v),
            'departments' => $options($counts('department'), fn ($v) => $v),
        ]]);
    }

    public function show(string $slug): JobDetailResource
    {
        $job = JobPosting::query()->open()->where('slug', $slug)->firstOrFail();

        $related = JobPosting::query()->open()
            ->whereKeyNot($job->id)
            ->orderByRaw('CASE WHEN department = ? THEN 0 ELSE 1 END', [(string) $job->department])
            ->sortBy('newest')
            ->limit(3)
            ->get();

        $job->setRelation('related', $related);

        return new JobDetailResource($job);
    }
}
