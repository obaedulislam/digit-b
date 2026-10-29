<?php

namespace Database\Seeders;

use App\Services\SiteSettings;
use Illuminate\Database\Seeder;

class SiteSettingsSeeder extends Seeder
{
    public function run(): void
    {
        app(SiteSettings::class)->update([
            'company' => [
                'name' => 'DIGIT-B',
                'tagline' => 'Moving Beyond 0 and 1 to B-coming Digital',
                'description' => 'DIGIT-B is a recruitment firm for headhunting and talent acquisition in retail supply chain technology. '
                    .'We connect retailers, logistics providers and the software companies that serve them with engineers, '
                    .'data specialists and technology leaders who have already solved the problems they are hiring for.',
            ],
            'contact' => [
                'email' => 'contact@digit-b.com',
                'phone' => '+1 (352) 256-9875',
                'address_lines' => ['Columbus, Ohio', 'United States'],
                'hours' => [
                    ['days' => 'Mon–Sat', 'time' => '10:00 – 18:00'],
                    ['days' => 'Sunday', 'time' => 'Closed'],
                ],
                'map_url' => null,
            ],
            // Placeholders (generic profile roots): replace with real company profiles in the admin.
            'social' => [
                'linkedin' => 'https://www.linkedin.com/',
                'facebook' => 'https://www.facebook.com/',
                'x' => 'https://x.com/',
                'instagram' => null,
            ],
            'stats' => [
                ['value' => '10+', 'label' => 'Years in retail supply chain tech'],
                ['value' => '30–45', 'label' => 'Days average time to fill'],
                ['value' => '5', 'label' => 'Flexible hiring models'],
                ['value' => '1:1', 'label' => 'Dedicated recruiter per search'],
            ],
            'seo' => [
                'site_title' => 'DIGIT-B | Retail Supply Chain Tech Recruitment',
                'default_description' => 'Recruitment firm for headhunting and talent acquisition in retail supply chain technology. '
                    .'Direct hire, contract, temporary staffing, payrolling and executive search.',
                'og_image' => null,
            ],
        ]);
    }
}
