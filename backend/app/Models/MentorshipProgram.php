<?php

namespace App\Models;

use App\Enums\MentorshipTier;
use App\Support\Formatters;
use Database\Factories\MentorshipProgramFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MentorshipProgram extends Model
{
    /** @use HasFactory<MentorshipProgramFactory> */
    use HasFactory;

    protected $fillable = [
        'slug', 'name', 'tier', 'audience', 'summary', 'price_amount', 'price_currency', 'price_unit_label',
        'features', 'is_featured', 'cta_label', 'is_published', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'tier' => MentorshipTier::class,
            'features' => 'array',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'price_amount' => 'decimal:2',
            'sort_order' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function requests(): HasMany
    {
        return $this->hasMany(MentorshipRequest::class);
    }

    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true);
    }

    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('id');
    }

    public function priceDisplay(): ?string
    {
        return Formatters::price($this->price_amount, $this->price_currency, $this->price_unit_label);
    }
}
