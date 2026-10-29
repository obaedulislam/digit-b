<?php

namespace Database\Factories;

use App\Models\MentorshipProgram;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<MentorshipProgram> */
class MentorshipProgramFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 9999),
            'name' => ucfirst($name),
            'tier' => 'standard',
            'audience' => 'individuals',
            'summary' => fake()->sentence(12),
            'price_amount' => 9.82,
            'price_currency' => 'USD',
            'price_unit_label' => 'per person / month',
            'features' => ['Weekly 1:1 sessions', 'Career roadmap'],
            'is_featured' => false,
            'cta_label' => 'Get Started',
            'is_published' => true,
            'sort_order' => 0,
        ];
    }
}
