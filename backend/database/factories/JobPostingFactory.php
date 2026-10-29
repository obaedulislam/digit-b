<?php

namespace Database\Factories;

use App\Enums\EmploymentType;
use App\Enums\JobStatus;
use App\Enums\WorkMode;
use App\Models\JobPosting;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<JobPosting> */
class JobPostingFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->jobTitle();

        return [
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1, 99999),
            'title' => $title,
            'reference_code' => null,
            'employment_type' => EmploymentType::FullTime->value,
            'work_mode' => WorkMode::Hybrid->value,
            'location' => 'Columbus, Ohio',
            'country' => 'United States',
            'department' => 'Engineering',
            'salary_min' => 80000,
            'salary_max' => 100000,
            'salary_currency' => 'USD',
            'salary_period' => 'year',
            'show_salary' => true,
            'experience_min' => 3,
            'experience_max' => 5,
            'status' => JobStatus::Published->value,
            'published_at' => now()->subDays(fake()->numberBetween(1, 20)),
            'closes_at' => null,
            'is_featured' => false,
            'summary' => fake()->sentence(14),
            'description_markdown' => "## About the role\n\n".fake()->paragraph(),
            'responsibilities' => ['Own delivery of features', 'Collaborate with product'],
            'requirements' => ['3+ years of experience'],
            'nice_to_have' => ['Retail domain knowledge'],
            'benefits' => ['Health insurance'],
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => JobStatus::Draft->value, 'published_at' => null]);
    }

    public function closed(): static
    {
        return $this->state(['status' => JobStatus::Closed->value]);
    }

    public function expired(): static
    {
        return $this->state(['closes_at' => now()->subDay()]);
    }
}
