<?php

namespace App\Models;

use App\Enums\FaqGroup;
use Database\Factories\FaqFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    /** @use HasFactory<FaqFactory> */
    use HasFactory;

    protected $fillable = ['group', 'question', 'answer', 'is_published', 'sort_order'];

    protected function casts(): array
    {
        return ['group' => FaqGroup::class, 'is_published' => 'boolean', 'sort_order' => 'integer'];
    }

    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true);
    }

    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('id');
    }
}
