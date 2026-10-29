<?php

namespace App\Models;

use App\Enums\EmploymentType;
use App\Enums\JobStatus;
use App\Enums\SalaryPeriod;
use App\Enums\WorkMode;
use App\Support\Formatters;
use App\Support\QueryHelpers;
use Database\Factories\JobPostingFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobPosting extends Model
{
    /** @use HasFactory<JobPostingFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slug', 'title', 'reference_code', 'employment_type', 'work_mode', 'location', 'country', 'department',
        'salary_min', 'salary_max', 'salary_currency', 'salary_period', 'show_salary',
        'experience_min', 'experience_max', 'status', 'closes_at', 'published_at', 'is_featured',
        'summary', 'description_markdown', 'responsibilities', 'requirements', 'nice_to_have', 'benefits',
        'seo_title', 'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'employment_type' => EmploymentType::class,
            'work_mode' => WorkMode::class,
            'status' => JobStatus::class,
            'salary_period' => SalaryPeriod::class,
            'show_salary' => 'boolean',
            'is_featured' => 'boolean',
            'closes_at' => 'datetime',
            'published_at' => 'datetime',
            'responsibilities' => 'array',
            'requirements' => 'array',
            'nice_to_have' => 'array',
            'benefits' => 'array',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    /** Published, already live and not past its closing date. */
    public function scopeOpen(Builder $query): void
    {
        $query->where('status', JobStatus::Published->value)
            ->where(fn (Builder $q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->where(fn (Builder $q) => $q->whereNull('closes_at')->orWhere('closes_at', '>', now()));
    }

    /** Public listing filters (all values are bound parameters). */
    public function scopeFilter(Builder $query, array $params): void
    {
        QueryHelpers::search($query, $params['search'] ?? null, ['title', 'summary', 'department', 'location', 'reference_code']);

        if ($type = EmploymentType::tryFrom((string) ($params['employment_type'] ?? ''))) {
            $query->where('employment_type', $type->value);
        }
        if ($mode = WorkMode::tryFrom((string) ($params['work_mode'] ?? ''))) {
            $query->where('work_mode', $mode->value);
        }
        if (filled($params['location'] ?? null)) {
            $query->where('location', (string) $params['location']);
        }
        if (filled($params['department'] ?? null)) {
            $query->where('department', (string) $params['department']);
        }
    }

    public function scopeSortBy(Builder $query, ?string $sort): void
    {
        match ($sort) {
            'salary_desc' => $query->orderByRaw('salary_max IS NULL')->orderByDesc('salary_max')->orderByDesc('published_at'),
            'title' => $query->orderBy('title'),
            default => $query->orderByDesc('published_at')->orderByDesc('id'),
        };
    }

    public function salaryDisplay(): ?string
    {
        return Formatters::salaryRange($this->salary_min, $this->salary_max, $this->salary_currency, $this->salary_period->value);
    }

    public function experienceDisplay(): ?string
    {
        return Formatters::experienceRange($this->experience_min, $this->experience_max);
    }
}
