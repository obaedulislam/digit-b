<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

/**
 * Names carried over from the legacy site; the quotes and attributions are
 * placeholders written for the rebuild and must be replaced with real,
 * approved testimonials before launch.
 */
class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'name' => 'Jessica Brown',
                'role' => 'VP of Technology',
                'company' => 'Regional grocery retailer',
                'quote' => 'DIGIT-B understood our order management stack within the first call. The engineers they introduced could discuss fulfilment edge cases from day one, which saved us weeks of interviewing.',
            ],
            [
                'name' => 'Michael Thompson',
                'role' => 'Director of Engineering',
                'company' => 'E-commerce logistics platform',
                'quote' => 'Every candidate on the shortlist was relevant and genuinely interested. The recruiter prepared them well and kept us informed, so we hired in under six weeks.',
            ],
            [
                'name' => 'Emily Davis',
                'role' => 'Head of Talent',
                'company' => 'Retail software vendor',
                'quote' => 'What I value most is the support after the offer. They stayed in touch with both sides through the first three months, and our new hire settled in quickly.',
            ],
            [
                'name' => 'David Lee',
                'role' => 'Senior Software Engineer',
                'company' => 'Placed candidate',
                'quote' => 'My recruiter listened to what I wanted next instead of pushing the nearest vacancy. The role they found fits my skills and my life, and the process was honest throughout.',
            ],
            [
                'name' => 'John Wick',
                'role' => 'Supply Chain Data Analyst',
                'company' => 'Placed candidate',
                'quote' => 'I switched from a different industry and was nervous about it. DIGIT-B coached me through the interviews and matched me with a team that values learning.',
            ],
        ];

        foreach ($items as $i => $item) {
            Testimonial::query()->updateOrCreate(
                ['name' => $item['name']],
                $item + ['rating' => 5, 'is_published' => true, 'sort_order' => $i + 1],
            );
        }
    }
}
