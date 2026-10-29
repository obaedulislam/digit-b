<?php

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Enums\PostType;
use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Post> */
class PostFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->sentence(6);

        return [
            'type' => PostType::Article->value,
            'post_category_id' => PostCategory::factory(),
            'author_name' => 'DIGIT-B Editorial Team',
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1, 99999),
            'title' => $title,
            'excerpt' => fake()->sentence(18),
            'cover_image' => null,
            'body_markdown' => "## Heading\n\n".implode("\n\n", fake()->paragraphs(4)),
            'status' => ContentStatus::Published->value,
            'published_at' => now()->subDays(fake()->numberBetween(1, 30)),
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => ContentStatus::Draft->value, 'published_at' => null]);
    }

    public function blog(): static
    {
        return $this->state(['type' => PostType::Blog->value]);
    }
}
