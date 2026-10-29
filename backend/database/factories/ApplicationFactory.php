<?php

namespace Database\Factories;

use App\Enums\ApplicationStatus;
use App\Models\Applicant;
use App\Models\Application;
use App\Models\JobPosting;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Application> */
class ApplicationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'applicant_id' => Applicant::factory(),
            'job_posting_id' => JobPosting::factory(),
            'status' => ApplicationStatus::New->value,
            'work_status' => 'remote',
            'expected_salary' => null,
            'available_from' => null,
            'cover_letter' => null,
            'resume_path' => 'resumes/2026/01/'.fake()->lexify('????????????').'.pdf',
            'resume_original_name' => 'cv.pdf',
            'resume_mime' => 'application/pdf',
            'resume_size' => 1024,
            'consented_at' => now(),
        ];
    }
}
