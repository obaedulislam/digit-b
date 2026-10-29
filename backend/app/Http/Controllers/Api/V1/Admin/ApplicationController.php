<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Actions\UpdateApplication;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApplicationUpdateRequest;
use App\Http\Resources\Admin\ApplicationDetailResource;
use App\Http\Resources\Admin\ApplicationResource;
use App\Models\Application;
use App\Support\CsvExport;
use App\Support\QueryHelpers;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ApplicationController extends Controller
{
    private const SORTABLE = ['id', 'created_at', 'updated_at', 'status'];

    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Application::class);

        $query = Application::query()->with(['applicant', 'job'])->filter($request->query());
        QueryHelpers::sort($query, $request->query('sort'), self::SORTABLE, '-created_at');

        return ApplicationResource::collection($query->paginate(QueryHelpers::perPage($request))->withQueryString());
    }

    public function show(string $id): ApplicationDetailResource
    {
        $application = Application::query()->with(['applicant', 'job', 'events.user'])->findOrFail($id);
        Gate::authorize('view', $application);

        return new ApplicationDetailResource($application);
    }

    public function update(ApplicationUpdateRequest $request, string $id, UpdateApplication $action): ApplicationDetailResource
    {
        $application = Application::query()->findOrFail($id);
        Gate::authorize('update', $application);

        $action->handle($application, $request->validated(), $request->user());

        return new ApplicationDetailResource($application->load(['applicant', 'job', 'events.user']));
    }

    public function destroy(string $id): Response
    {
        $application = Application::query()->findOrFail($id);
        Gate::authorize('delete', $application);

        // Soft delete: the résumé file is kept so the record can be restored.
        $application->delete();

        return response()->noContent();
    }

    public function resume(string $id): StreamedResponse
    {
        $application = Application::query()->with('applicant')->findOrFail($id);
        Gate::authorize('downloadResume', $application);

        $disk = Storage::disk(config('digitb.resume_disk'));
        abort_unless($application->resume_path && $disk->exists($application->resume_path), 404, 'Resume file not found.');

        $extension = pathinfo($application->resume_path, PATHINFO_EXTENSION);
        $filename = Str::slug($application->applicant->full_name ?: 'candidate').'-resume.'.$extension;

        return $disk->download($application->resume_path, $filename, [
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'no-store, private',
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        Gate::authorize('viewAny', Application::class);

        $query = Application::query()->with(['applicant', 'job'])->filter($request->query())->orderBy('id');

        return CsvExport::stream(
            'applications-'.now()->format('Ymd-His').'.csv',
            ['ID', 'Submitted at', 'Status', 'First name', 'Last name', 'Email', 'Phone', 'Location', 'Job', 'Job reference',
                'Current title', 'Current company', 'Years of experience', 'Education', 'Work status', 'Expected salary',
                'Available from', 'LinkedIn', 'Skills'],
            $query,
            fn (Application $a) => [
                $a->id,
                $a->created_at?->toIso8601String(),
                $a->status->value,
                $a->applicant->first_name,
                $a->applicant->last_name,
                $a->applicant->email,
                $a->applicant->phone,
                $a->applicant->location,
                $a->job?->title ?? 'General talent pool',
                $a->job?->reference_code,
                $a->applicant->current_title,
                $a->applicant->current_company,
                $a->applicant->years_experience,
                $a->applicant->highest_education,
                $a->work_status->value,
                $a->expected_salary,
                $a->available_from?->toDateString(),
                $a->applicant->linkedin_url,
                implode('; ', $a->applicant->skills ?? []),
            ],
        );
    }
}
