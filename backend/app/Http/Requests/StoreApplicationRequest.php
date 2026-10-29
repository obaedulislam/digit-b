<?php

namespace App\Http\Requests;

use App\Enums\EducationLevel;
use App\Enums\WorkMode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $skills = $this->input('skills');

        if (is_string($skills)) {
            $skills = collect(explode(',', $skills))
                ->map(fn ($s) => trim($s))
                ->filter()
                ->values()
                ->all();
            $this->merge(['skills' => $skills]);
        }

        if (is_string($this->input('email'))) {
            $this->merge(['email' => mb_strtolower(trim($this->input('email')))]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'job' => [
                'nullable', 'string', 'max:255',
                Rule::exists('job_postings', 'slug')
                    ->where('status', 'published')
                    ->where(fn ($q) => $q->whereNull('deleted_at')
                        ->where(fn ($q) => $q->whereNull('closes_at')->orWhere('closes_at', '>', now()))),
            ],
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'phone' => ['required', 'string', 'min:7', 'max:20', 'regex:/^[0-9+().\-\s]+$/'],
            'location' => ['required', 'string', 'max:120'],
            'linkedin_url' => ['nullable', 'url:http,https', 'max:255'],
            'current_title' => ['required', 'string', 'max:120'],
            'current_company' => ['nullable', 'string', 'max:255'],
            'years_experience' => ['required', 'integer', 'between:0,60'],
            'highest_education' => ['required', Rule::in(EducationLevel::values())],
            'skills' => ['nullable', 'array', 'max:15'],
            'skills.*' => ['string', 'max:40'],
            'work_status' => ['required', Rule::in(WorkMode::values())],
            'expected_salary' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'available_from' => ['nullable', 'date', 'after_or_equal:today'],
            'cover_letter' => ['nullable', 'string', 'max:4000'],
            'resume' => [
                'required',
                File::types(['pdf', 'doc', 'docx'])->max(config('digitb.resume_max_kb', 5120)),
                'extensions:pdf,doc,docx',
            ],
            'consent' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'resume.max' => 'The résumé must not be larger than 5 MB.',
            'consent.accepted' => 'Please accept the privacy policy to continue.',
        ];
    }
}
