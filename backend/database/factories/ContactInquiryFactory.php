<?php

namespace Database\Factories;

use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Models\ContactInquiry;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ContactInquiry> */
class ContactInquiryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => null,
            'company' => fake()->company(),
            'inquiry_type' => InquiryType::Hiring->value,
            'subject' => fake()->sentence(4),
            'message' => fake()->paragraph(),
            'status' => InquiryStatus::New->value,
            'consented_at' => now(),
        ];
    }
}
