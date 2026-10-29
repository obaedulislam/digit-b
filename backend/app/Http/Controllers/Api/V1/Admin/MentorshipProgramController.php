<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\MentorshipTier;
use App\Http\Requests\Admin\MentorshipProgramRequest;
use App\Http\Resources\Admin\MentorshipProgramResource;
use App\Models\MentorshipProgram;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class MentorshipProgramController extends CrudController
{
    protected string $model = MentorshipProgram::class;

    protected string $resource = MentorshipProgramResource::class;

    protected string $requestClass = MentorshipProgramRequest::class;

    protected array $sortable = ['id', 'name', 'tier', 'sort_order', 'is_published', 'created_at'];

    protected array $searchable = ['name', 'slug', 'summary'];

    protected string $defaultSort = 'sort_order';

    protected ?string $slugSource = 'name';

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($tier = MentorshipTier::tryFrom((string) $request->query('tier'))) {
            $query->where('tier', $tier->value);
        }
        if ($request->filled('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }
    }
}
