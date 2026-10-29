<?php

namespace Database\Factories;

use App\Enums\EducationLevel;
use App\Models\Applicant;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Applicant> */
class ApplicantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => '+1 555 010 '.fake()->numerify('####'),
            'location' => fake()->city().', '.fake()->stateAbbr(),
            'linkedin_url' => null,
            'current_title' => fake()->randomElement(['Software Engineer', 'QA Analyst', 'Project Manager', 'Data Analyst']),
            'current_company' => fake()->company(),
            'years_experience' => fake()->numberBetween(1, 15),
            'highest_education' => EducationLevel::Bachelor->value,
            'skills' => ['PHP', 'SQL'],
        ];
    }
}
