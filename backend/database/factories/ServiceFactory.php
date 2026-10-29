<?php

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Enums\ServiceGroup;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Service> */
class ServiceFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->words(3, true);

        return [
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1, 9999),
            'title' => ucfirst($title),
            'summary' => fake()->sentence(14),
            'icon' => 'briefcase',
            'group' => ServiceGroup::Solution->value,
            'features' => ['Feature one', 'Feature two'],
            'process_steps' => [['title' => 'Discover', 'description' => 'We learn your needs.']],
            'advantages' => [['title' => 'Speed', 'description' => 'Faster hiring.']],
            'body_markdown' => fake()->paragraph(),
            'status' => ContentStatus::Published->value,
            'sort_order' => 0,
        ];
    }
}
