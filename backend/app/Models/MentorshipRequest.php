<?php

namespace App\Models;

use App\Enums\InquiryStatus;
use App\Support\QueryHelpers;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MentorshipRequest extends Model
{
    protected $fillable = [
        'mentorship_program_id', 'name', 'email', 'phone', 'current_role', 'goal',
        'status', 'notes', 'consented_at', 'ip_address',
    ];

    protected $hidden = ['ip_address'];

    protected function casts(): array
    {
        return [
            'status' => InquiryStatus::class,
            'consented_at' => 'datetime',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(MentorshipProgram::class, 'mentorship_program_id');
    }

    public function scopeFilter(Builder $query, array $params): void
    {
        QueryHelpers::search($query, $params['search'] ?? null, ['name', 'email', 'goal']);

        if ($status = InquiryStatus::tryFrom((string) ($params['status'] ?? ''))) {
            $query->where('status', $status->value);
        }
        if (filled($params['program'] ?? null) && is_numeric($params['program'])) {
            $query->where('mentorship_program_id', (int) $params['program']);
        }
    }
}
