<?php

namespace App\Models;

use App\Enums\ApplicationStatus;
use App\Enums\WorkMode;
use App\Support\QueryHelpers;
use Database\Factories\ApplicationFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Application extends Model
{
    /** @use HasFactory<ApplicationFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'applicant_id', 'job_posting_id', 'status', 'work_status', 'expected_salary', 'available_from',
        'cover_letter', 'notes', 'resume_path', 'resume_original_name', 'resume_mime', 'resume_size',
        'consented_at', 'ip_address',
    ];

    protected $hidden = ['resume_path', 'ip_address'];

    protected function casts(): array
    {
        return [
            'status' => ApplicationStatus::class,
            'work_status' => WorkMode::class,
            'available_from' => 'date',
            'consented_at' => 'datetime',
            'expected_salary' => 'integer',
        ];
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class, 'job_posting_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(ApplicationEvent::class)->orderBy('created_at')->orderBy('id');
    }

    public function scopeFilter(Builder $query, array $params): void
    {
        if ($status = ApplicationStatus::tryFrom((string) ($params['status'] ?? ''))) {
            $query->where('status', $status->value);
        }

        if (filled($params['job'] ?? null)) {
            $job = $params['job'];
            // Accept either a numeric id or a slug.
            $query->whereHas('job', fn (Builder $q) => is_numeric($job)
                ? $q->where('job_postings.id', (int) $job)
                : $q->where('job_postings.slug', (string) $job));
        }

        if (filled($params['search'] ?? null)) {
            $like = QueryHelpers::like((string) $params['search']);
            $query->whereHas('applicant', fn (Builder $q) => $q->where(function (Builder $w) use ($like) {
                $w->where('first_name', 'like', $like)
                    ->orWhere('last_name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('current_title', 'like', $like)
                    ->orWhere('location', 'like', $like);
            }));
        }

        if (filled($params['date_from'] ?? null) && strtotime((string) $params['date_from'])) {
            $query->where('created_at', '>=', date('Y-m-d 00:00:00', strtotime((string) $params['date_from'])));
        }
        if (filled($params['date_to'] ?? null) && strtotime((string) $params['date_to'])) {
            $query->where('created_at', '<=', date('Y-m-d 23:59:59', strtotime((string) $params['date_to'])));
        }
    }
}
