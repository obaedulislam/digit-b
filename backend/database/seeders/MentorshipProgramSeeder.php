<?php

namespace Database\Seeders;

use App\Enums\MentorshipTier;
use App\Models\MentorshipProgram;
use Illuminate\Database\Seeder;

/**
 * Prices ($9.82 / $7.25 per person per month; $9.5k / $15k per role per month)
 * are carried over from the live site and look like template leftovers.
 * They are editable in the admin and flagged in docs/PROGRESS.md "Open items".
 */
class MentorshipProgramSeeder extends Seeder
{
    public function run(): void
    {
        $programs = [
            [
                'slug' => 'career-switch',
                'name' => 'Career Switch',
                'tier' => MentorshipTier::Standard->value,
                'audience' => 'individuals',
                'summary' => 'Move into retail supply chain technology from another field with a mentor, a learning plan and interview coaching.',
                'price_amount' => 9.82,
                'price_unit_label' => 'per person / month',
                'features' => [
                    'Monthly 1:1 session with a supply chain technology practitioner',
                    'Personalised skills-gap assessment and learning roadmap',
                    'Domain primer: warehouse, transport and order management basics',
                    'Résumé and LinkedIn review for retail technology roles',
                    'Mock interviews with feedback',
                ],
                'is_featured' => false,
                'sort_order' => 1,
            ],
            [
                'slug' => 'first-job',
                'name' => 'First Job',
                'tier' => MentorshipTier::Standard->value,
                'audience' => 'individuals',
                'summary' => 'Graduates and early-career technologists get guidance to land and succeed in a first role in the industry.',
                'price_amount' => 7.25,
                'price_unit_label' => 'per person / month',
                'features' => [
                    'Fortnightly check-ins with a mentor',
                    'Portfolio and project advice tailored to retail technology',
                    'Introduction to junior openings in our network',
                    'Interview preparation and offer-evaluation guidance',
                    'First-90-days plan once you start',
                ],
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'temporary',
                'name' => 'Temporary',
                'tier' => MentorshipTier::Premium->value,
                'audience' => 'employers',
                'summary' => 'Structured mentoring for temporary specialists, so short engagements reach full productivity quickly.',
                'price_amount' => 9500,
                'price_unit_label' => 'per role / month',
                'features' => [
                    'Dedicated mentor assigned to each temporary placement',
                    'Rapid onboarding plan covering systems, processes and stakeholders',
                    'Weekly progress reviews shared with the hiring manager',
                    'Knowledge-transfer sessions before the assignment ends',
                    'Option to extend or convert to permanent with a documented review',
                ],
                'is_featured' => false,
                'sort_order' => 3,
            ],
            [
                'slug' => 'contract',
                'name' => 'Contract',
                'tier' => MentorshipTier::Premium->value,
                'audience' => 'employers',
                'summary' => 'Senior mentoring and delivery oversight for contract specialists on integrations, migrations and quality programmes.',
                'price_amount' => 15000,
                'price_unit_label' => 'per role / month',
                'features' => [
                    'Senior practitioner mentor and delivery adviser per contractor',
                    'Scope, milestone and risk review at project start',
                    'Bi-weekly quality and delivery check-ins',
                    'Documentation and handover standards for retail supply chain systems',
                    'Contract-to-hire evaluation report at the end of the engagement',
                ],
                'is_featured' => false,
                'sort_order' => 4,
            ],
        ];

        foreach ($programs as $program) {
            MentorshipProgram::query()->updateOrCreate(
                ['slug' => $program['slug']],
                $program + ['price_currency' => 'USD', 'cta_label' => 'Get Started', 'is_published' => true],
            );
        }
    }
}
