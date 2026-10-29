<?php

namespace App\Models;

use Database\Factories\ApplicantFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Applicant extends Model
{
    /** @use HasFactory<ApplicantFactory> */
    use HasFactory;

    protected $fillable = [
        'first_name', 'last_name', 'email', 'phone', 'location', 'linkedin_url',
        'current_title', 'current_company', 'years_experience', 'highest_education', 'skills',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'years_experience' => 'integer',
        ];
    }

    protected function fullName(): Attribute
    {
        return Attribute::get(fn () => trim($this->first_name.' '.$this->last_name));
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }
}
