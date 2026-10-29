<?php

namespace Database\Factories;

use App\Enums\FaqGroup;
use App\Models\Faq;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Faq> */
class FaqFactory extends Factory
{
    public function definition(): array
    {
        return [
            'group' => FaqGroup::About->value,
            'question' => rtrim(fake()->sentence(7), '.').'?',
            'answer' => fake()->paragraph(),
            'is_published' => true,
            'sort_order' => 0,
        ];
    }
}
