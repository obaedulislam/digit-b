<?php

namespace Database\Factories;

use App\Models\PostCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<PostCategory> */
class PostCategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return ['slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 9999), 'name' => ucfirst($name), 'type' => null];
    }
}
