<?php

namespace App\Http\Requests\Admin;

use App\Enums\EmploymentType;
use App\Enums\JobStatus;
use App\Enums\SalaryPeriod;
use App\Enums\WorkMode;
use Illuminate\Validation\Rule;

class JobRequest extends AdminRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('salary_currency'))) {
            $this->merge(['salary_currency' => strtoupper($this->input('salary_currency'))]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $req = $this->req();
        $id = $this->routeId();

        return [
            'title' => [$req, 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('job_postings', 'slug')->ignore($id)],
            'reference_code' => ['nullable', 'string', 'max:40', Rule::unique('job_postings', 'reference_code')->ignore($id)],
            'employment_type' => [$req, Rule::in(EmploymentType::values())],
            'work_mode' => [$req, Rule::in(WorkMode::values())],
            'location' => [$req, 'string', 'max:120'],
            'country' => ['nullable', 'string', 'max:80'],
            'department' => ['nullable', 'string', 'max:80'],
            'salary_min' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'salary_max' => ['nullable', 'integer', 'min:0', 'max:100000000', Rule::when($this->filled('salary_min'), 'gte:salary_min')],
            'salary_currency' => ['sometimes', 'string', 'size:3', 'alpha'],
            'salary_period' => ['sometimes', Rule::in(SalaryPeriod::values())],
            'show_salary' => ['sometimes', 'boolean'],
            'experience_min' => ['nullable', 'integer', 'between:0,60'],
            'experience_max' => ['nullable', 'integer', 'between:0,60', Rule::when($this->filled('experience_min'), 'gte:experience_min')],
            'status' => ['sometimes', Rule::in(JobStatus::values())],
            'closes_at' => ['nullable', 'date'],
            'published_at' => ['nullable', 'date'],
            'is_featured' => ['sometimes', 'boolean'],
            'summary' => [$req, 'string', 'max:500'],
            'description_markdown' => [$req, 'string', 'max:50000'],
            'responsibilities' => ['nullable', 'array', 'max:30'],
            'responsibilities.*' => ['string', 'max:500'],
            'requirements' => ['nullable', 'array', 'max:30'],
            'requirements.*' => ['string', 'max:500'],
            'nice_to_have' => ['nullable', 'array', 'max:30'],
            'nice_to_have.*' => ['string', 'max:500'],
            'benefits' => ['nullable', 'array', 'max:30'],
            'benefits.*' => ['string', 'max:500'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:320'],
        ];
    }
}
