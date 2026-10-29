<?php

namespace App\Models;

use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Support\QueryHelpers;
use Database\Factories\ContactInquiryFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactInquiry extends Model
{
    /** @use HasFactory<ContactInquiryFactory> */
    use HasFactory;

    protected $fillable = [
        'name', 'email', 'phone', 'company', 'inquiry_type', 'subject', 'message',
        'status', 'notes', 'consented_at', 'ip_address',
    ];

    protected $hidden = ['ip_address'];

    protected function casts(): array
    {
        return [
            'inquiry_type' => InquiryType::class,
            'status' => InquiryStatus::class,
            'consented_at' => 'datetime',
        ];
    }

    public function scopeFilter(Builder $query, array $params): void
    {
        QueryHelpers::search($query, $params['search'] ?? null, ['name', 'email', 'company', 'subject', 'message']);

        if ($status = InquiryStatus::tryFrom((string) ($params['status'] ?? ''))) {
            $query->where('status', $status->value);
        }
        if ($type = InquiryType::tryFrom((string) ($params['inquiry_type'] ?? ''))) {
            $query->where('inquiry_type', $type->value);
        }
    }
}
