<?php

namespace Database\Seeders;

use App\Enums\FaqGroup;
use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->faqs() as $group => $items) {
            foreach ($items as $i => [$question, $answer]) {
                Faq::query()->updateOrCreate(
                    ['group' => $group, 'question' => $question],
                    ['answer' => $answer, 'is_published' => true, 'sort_order' => $i + 1],
                );
            }
        }
    }

    /** @return array<string, list<array{0: string, 1: string}>> */
    private function faqs(): array
    {
        return [
            FaqGroup::About->value => [
                ['What industries do you specialize in?', 'We focus on retail supply chain technology: retailers, e-commerce businesses, logistics and fulfilment providers, and the software companies that serve them. Our recruiters work in this space every day, so we speak the language of warehouse, transport, inventory and order management.'],
                ['How do you ensure candidates are the right fit for my company?', 'We combine a detailed intake with your team, technical and behavioural screening, and a conversation about each candidate\'s motivation and expectations. We present only people who match both the role and the way your team works.'],
                ['Can you help with remote hiring?', 'Yes. We place remote, hybrid and on-site specialists, and we advise on compensation, time-zone overlap and onboarding practices that make distributed teams effective.'],
                ['How long does it take to fill a position?', 'Most roles are filled in 30 to 45 days from the start of the search. Highly specialised or leadership roles can take longer, and we will tell you early if the brief needs adjusting to be realistic.'],
                ['Do you offer support after a candidate is hired?', 'Yes. We stay in touch with you and the new hire through the first 90 days, address concerns early and provide a replacement guarantee on permanent placements.'],
            ],
            FaqGroup::Employers->value => [
                ['How does your fee structure work?', 'Fees depend on the hiring model. Direct hire is success-based and paid only when a candidate accepts and starts. Contract, temporary and payrolling arrangements are charged as a transparent margin on the agreed rate. You will always receive the terms in writing before work begins.'],
                ['How do I start a search with you?', 'Use the contact form and choose "Hiring", or call us. We schedule a short intake call to understand the role, the team and the timeline, and we usually share a first shortlist within two weeks.'],
                ['Is there a replacement guarantee?', 'Permanent placements include a replacement guarantee for an agreed period after the start date. The exact terms are set out in your agreement.'],
                ['Can you support several roles at once?', 'Yes. We regularly run parallel searches and can assign additional recruiters, or set up a recruitment partnership for sustained hiring plans.'],
            ],
            FaqGroup::Candidates->value => [
                ['Does it cost anything to work with DIGIT-B?', 'No. Our service is always free for candidates. Employers pay for our work.'],
                ['What happens to my résumé after I apply?', 'A recruiter reviews it and, if there is a potential match, contacts you to discuss opportunities. With your consent we keep your details in our talent pool so we can contact you about future roles. You can ask us to delete your data at any time.'],
                ['Will you share my profile without asking me?', 'Never. We introduce you to an employer only after you have agreed to the specific role and company.'],
                ['I am changing careers. Can you still help?', 'Yes. We run mentorship programmes for career switchers and first-job seekers, and we work with employers who value potential and are willing to train.'],
            ],
        ];
    }
}
