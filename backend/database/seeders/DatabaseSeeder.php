<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            AdminUserSeeder::class,
            SiteSettingsSeeder::class,
            ServiceSeeder::class,
            JobSeeder::class,
            PostSeeder::class,
            TestimonialSeeder::class,
            MentorshipProgramSeeder::class,
            FaqSeeder::class,
        ]);

        // Demo users and sample submissions: local development only.
        if (app()->environment('local')) {
            $this->call(LocalDemoSeeder::class);
        }
    }
}
