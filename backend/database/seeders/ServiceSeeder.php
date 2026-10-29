<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Enums\ServiceGroup;
use App\Models\Service;
use Illuminate\Database\Seeder;

/**
 * Six homepage "solutions" and five hiring models, written for retail
 * supply chain technology recruitment (replaces the live site's filler copy).
 */
class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->solutions() as $i => $service) {
            $this->upsert($service, ServiceGroup::Solution, $i + 1);
        }

        foreach ($this->hiringModels() as $i => $service) {
            $this->upsert($service, ServiceGroup::HiringModel, $i + 1);
        }
    }

    private function upsert(array $data, ServiceGroup $group, int $order): void
    {
        Service::query()->updateOrCreate(['slug' => $data['slug']], [
            'title' => $data['title'],
            'summary' => $data['summary'],
            'icon' => $data['icon'],
            'group' => $group->value,
            'features' => $data['features'],
            'process_steps' => $data['process_steps'],
            'advantages' => $data['advantages'],
            'body_markdown' => $data['body'],
            'status' => ContentStatus::Published->value,
            'sort_order' => $order,
            'seo_title' => $data['title'].' | DIGIT-B',
            'seo_description' => $data['summary'],
        ]);
    }

    /** @return list<array<string, mixed>> */
    private function solutions(): array
    {
        return [
            [
                'slug' => 'talent-acquisition',
                'title' => 'Talent Acquisition',
                'icon' => 'users',
                'summary' => 'End-to-end hiring for engineering, data and product roles across retail, e-commerce and logistics technology.',
                'features' => [
                    'Dedicated recruiter who learns your stack and roadmap',
                    'Structured screening against role-specific scorecards',
                    'Weekly pipeline reports and transparent funnel metrics',
                    'Offer management and notice-period follow-through',
                ],
                'process_steps' => [
                    ['title' => 'Intake', 'description' => 'We map the role, the team around it and the business problem it solves, then agree on a scorecard.'],
                    ['title' => 'Search', 'description' => 'We approach passive and active candidates from our network and from targeted market mapping.'],
                    ['title' => 'Evaluate', 'description' => 'Every shortlisted candidate is technically and behaviourally screened before you spend time on them.'],
                    ['title' => 'Close', 'description' => 'We coordinate interviews, references and offers, and stay involved until the start date.'],
                ],
                'advantages' => [
                    ['title' => 'Domain fluency', 'description' => 'Our recruiters understand warehouse management, order orchestration and demand planning systems, so briefs do not get lost in translation.'],
                    ['title' => 'Shortlists, not stacks', 'description' => 'You receive a small set of vetted, interested candidates rather than a pile of résumés.'],
                    ['title' => 'Predictable timelines', 'description' => 'Most roles are filled within 30 to 45 days, and we tell you early when a brief needs adjusting.'],
                ],
                'body' => "## Hiring that fits how supply chain technology teams actually work\n\nRetail supply chain platforms are unforgiving: a slow checkout integration or a broken inventory sync is felt by customers within minutes. The people who build and run these systems are scarce, and most are not looking at job boards.\n\nOur Talent Acquisition service gives you a dedicated recruiter who becomes an extension of your hiring team. We define what good looks like, find the people who have already done it elsewhere, and manage the process so your engineers can stay focused on delivery.\n\n### Best suited for\n\n- Retailers building or modernising in-house technology teams\n- Software vendors serving retail and logistics customers\n- Scale-ups that need to hire several roles in parallel",
            ],
            [
                'slug' => 'intelligence-consultation',
                'title' => 'Intelligence & Consultation',
                'icon' => 'chart',
                'summary' => 'Market intelligence on salaries, skills supply and competitor hiring so your plans are grounded in reality.',
                'features' => [
                    'Compensation benchmarking by role, level and region',
                    'Talent supply and competitor hiring maps',
                    'Job description and interview-process review',
                    'Workforce planning for new platforms and migrations',
                ],
                'process_steps' => [
                    ['title' => 'Discovery', 'description' => 'We clarify the decision you need to make: budget, location strategy, team shape or hiring sequence.'],
                    ['title' => 'Research', 'description' => 'We combine placement data, live market conversations and public signals into a focused analysis.'],
                    ['title' => 'Recommendation', 'description' => 'You receive a short written brief with clear options, trade-offs and a suggested path.'],
                    ['title' => 'Follow-up', 'description' => 'We revisit the numbers after the first hiring cycle and adjust the plan with you.'],
                ],
                'advantages' => [
                    ['title' => 'Based on real offers', 'description' => 'Our benchmarks come from offers and acceptances we negotiate every week, not from stale survey averages.'],
                    ['title' => 'Practical output', 'description' => 'Short, decision-ready briefs instead of long slide decks.'],
                    ['title' => 'Fewer failed searches', 'description' => 'Adjusting scope or compensation before you launch a search saves months of silence.'],
                ],
                'body' => "## Know the market before you commit to a plan\n\nMany hiring problems are planning problems. A role priced 15 percent below market, a requirement list that no single person satisfies, or an interview process that takes six weeks will stall a search no matter how good the recruiter is.\n\nOur consultation service uses the data we collect from daily candidate and client conversations to answer the questions leaders ask before they hire: what does this role really cost, where do these people work today, and what will make them say yes?\n\n### Typical engagements\n\n- Salary benchmarking for a new engineering or data function\n- Location and work-mode strategy (remote, hybrid, on-site)\n- Review of job descriptions and interview loops for conversion and candidate experience",
            ],
            [
                'slug' => 'talent-sourcing',
                'title' => 'Talent Sourcing',
                'icon' => 'search',
                'summary' => 'Proactive, research-led sourcing that reaches the specialists who never apply to advertised roles.',
                'features' => [
                    'Targeted outreach to passive candidates',
                    'Niche community and referral networks in retail tech',
                    'Talent pipelines built ahead of approved headcount',
                    'Diversity-aware sourcing strategies',
                ],
                'process_steps' => [
                    ['title' => 'Profile', 'description' => 'We define the ideal candidate profile, adjacent backgrounds and the companies worth approaching.'],
                    ['title' => 'Map', 'description' => 'Our researchers build a map of qualified people and rank them by fit and likelihood to move.'],
                    ['title' => 'Engage', 'description' => 'We start personal, relevant conversations rather than sending generic mass messages.'],
                    ['title' => 'Hand over', 'description' => 'Interested and qualified candidates are introduced with context on motivation and expectations.'],
                ],
                'advantages' => [
                    ['title' => 'Reach beyond job boards', 'description' => 'The strongest supply chain engineers are employed and busy; we go to them.'],
                    ['title' => 'Pipeline ready when you are', 'description' => 'Warm, pre-qualified candidates shorten the time between approval and first interview.'],
                    ['title' => 'Respectful outreach', 'description' => 'Candidates remember how they were approached, and so does your employer brand.'],
                ],
                'body' => "## Reach the people who are not looking\n\nThe majority of experienced technologists are not browsing job boards. They respond to a thoughtful message from someone who understands their work and can explain, specifically, why an opportunity is worth a conversation.\n\nOur sourcing service is built on that principle. We research the market, identify who is doing the work you need, and start relationships that continue beyond a single search.\n\n### What you get\n\n- A transparent target list and outreach summary\n- Candidate feedback on your employer proposition\n- A reusable talent pool for future roles",
            ],
            [
                'slug' => 'candidate-matching',
                'title' => 'Candidate Matching',
                'icon' => 'puzzle',
                'summary' => 'Skills, motivation and team fit assessed together, so placements last well beyond the probation period.',
                'features' => [
                    'Technical screening by recruiters with engineering backgrounds',
                    'Motivation and career-goal alignment checks',
                    'Team and culture fit conversations',
                    'Compensation and expectations alignment before interviews',
                ],
                'process_steps' => [
                    ['title' => 'Understand the team', 'description' => 'We learn how the team works, who the candidate will report to and what success looks like at six months.'],
                    ['title' => 'Understand the candidate', 'description' => 'We explore skills, ambitions, working style and non-negotiables in depth.'],
                    ['title' => 'Match', 'description' => 'We present only the candidates where both sides gain, with a written rationale for each.'],
                    ['title' => 'Support', 'description' => 'We debrief after every interview and help both sides reach a clear decision quickly.'],
                ],
                'advantages' => [
                    ['title' => 'Longer retention', 'description' => 'Matching on motivation as well as skills reduces early attrition.'],
                    ['title' => 'Faster decisions', 'description' => 'Expectations on salary, location and start date are settled before anyone meets.'],
                    ['title' => 'Honest advice', 'description' => 'We tell candidates and clients when a match is not right, even when it costs us a placement.'],
                ],
                'body' => "## A good match is more than a good résumé\n\nA candidate can tick every technical box and still be the wrong hire if the role will not grow with them, or if the team works in a way that does not suit them.\n\nCandidate Matching is our discipline of looking at both sides with equal care. We invest the time to understand the person and the team, and we introduce them only when we believe in the fit.\n\n### The result\n\nHiring managers meet fewer candidates but interview with more confidence. Candidates enter conversations knowing the role, the team and the package.",
            ],
            [
                'slug' => 'recruitment-solutions',
                'title' => 'Recruitment Solutions',
                'icon' => 'briefcase',
                'summary' => 'Flexible engagement models, from a single search to a full recruitment partnership, scaled to your hiring plan.',
                'features' => [
                    'Contingent, retained and hybrid search options',
                    'Recruitment process outsourcing for high-volume periods',
                    'Interview coordination and candidate care',
                    'Onboarding support through the first 90 days',
                ],
                'process_steps' => [
                    ['title' => 'Plan', 'description' => 'We review your hiring plan for the next two quarters and recommend the right engagement mix.'],
                    ['title' => 'Mobilise', 'description' => 'We assign recruiters, agree reporting and begin sourcing within days.'],
                    ['title' => 'Deliver', 'description' => 'Weekly pipeline reviews keep every search visible and accountable.'],
                    ['title' => 'Improve', 'description' => 'After each cycle we review metrics and refine the process with your team.'],
                ],
                'advantages' => [
                    ['title' => 'One partner, many models', 'description' => 'Mix permanent, contract and temporary hiring under a single relationship.'],
                    ['title' => 'Scales up and down', 'description' => 'Add capacity for a migration or peak season without a long-term commitment.'],
                    ['title' => 'Clear commercials', 'description' => 'Simple, written terms with no hidden charges.'],
                ],
                'body' => "## Recruitment that adapts to your plan\n\nHiring demand is rarely steady. A platform replacement, a new market launch or a peak trading period can double your needs for a quarter.\n\nOur Recruitment Solutions combine the services on this site into an arrangement that matches your plan: a single urgent search, a standing partnership, or a project team assembled from permanent and contract specialists.\n\nWe agree the scope, the metrics and the commercial terms upfront, then report against them every week.",
            ],
            [
                'slug' => 'executive-search',
                'title' => 'Executive Search',
                'icon' => 'crown',
                'summary' => 'Confidential searches for CTOs, VPs of Engineering and heads of supply chain technology.',
                'features' => [
                    'Fully confidential, retained search process',
                    'Leadership assessment and reference diligence',
                    'Market-informed compensation and equity guidance',
                    'Onboarding and first-100-days support',
                ],
                'process_steps' => [
                    ['title' => 'Alignment', 'description' => 'We work with the board or CEO to define the mandate, the outcomes and the leadership profile.'],
                    ['title' => 'Research and approach', 'description' => 'Discreet market mapping followed by personal, senior-level conversations.'],
                    ['title' => 'Assessment', 'description' => 'Structured interviews, case discussions and in-depth referencing for a small slate of finalists.'],
                    ['title' => 'Appointment', 'description' => 'We advise on the offer, manage negotiation and support the transition into the role.'],
                ],
                'advantages' => [
                    ['title' => 'Discretion', 'description' => 'Replacements and new leadership roles are handled with strict confidentiality.'],
                    ['title' => 'Senior network', 'description' => 'Relationships with technology leaders across retail, logistics and supply chain software.'],
                    ['title' => 'Evidence-based assessment', 'description' => 'Decisions grounded in structured evaluation instead of impressions.'],
                ],
                'body' => "## Leadership hires shape everything that follows\n\nThe right technology leader sets the architecture, the culture and the pace of delivery for years. A mis-hire at this level is costly in time, morale and momentum.\n\nOur Executive Search practice is deliberately small and hands-on. Every mandate is led by a senior consultant who stays personally involved from the first alignment meeting to the new leader's first 100 days.\n\n### Typical mandates\n\n- Chief Technology Officer and VP Engineering\n- Head of Supply Chain Technology and Digital\n- Chief Data and Analytics Officer",
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    private function hiringModels(): array
    {
        return [
            [
                'slug' => 'temporary-staffing',
                'title' => 'Temporary Staffing',
                'icon' => 'clock',
                'summary' => 'Qualified specialists on short notice to cover peaks, leave, migrations and project crunches.',
                'features' => [
                    'Pre-screened bench of engineers, analysts and QA specialists',
                    'Placement typically within days, not weeks',
                    'Flexible terms from two weeks to twelve months',
                    'Replacement guarantee if the fit is wrong',
                ],
                'process_steps' => [
                    ['title' => 'Request', 'description' => 'Share the skills, start date and expected duration. Most briefs take one short call.'],
                    ['title' => 'Shortlist', 'description' => 'We present available, pre-vetted specialists within 48 to 72 hours.'],
                    ['title' => 'Onboard', 'description' => 'We handle paperwork, compliance checks and first-day readiness.'],
                    ['title' => 'Review', 'description' => 'We check in during the assignment and adjust or extend as your needs change.'],
                ],
                'advantages' => [
                    ['title' => 'Speed', 'description' => 'Cover critical roles quickly without lengthy permanent searches.'],
                    ['title' => 'Flexibility', 'description' => 'Scale capacity up or down without long-term commitments.'],
                    ['title' => 'Reduced risk', 'description' => 'Try working styles and skills before deciding on a permanent hire.'],
                ],
                'body' => "## Skilled people, exactly when you need them\n\nPeak trading season, a platform cut-over or a key engineer on extended leave: these moments cannot wait for a three-month permanent search.\n\nTemporary Staffing gives you access to a bench of pre-screened specialists across software engineering, quality assurance, data and project delivery. We handle sourcing, verification and administration so the person is productive from day one.\n\n### How it works with other models\n\nMany clients start with a temporary placement and convert to permanent once the fit is proven. See *Direct Hire* and *Contract* for those routes.",
            ],
            [
                'slug' => 'direct-hire',
                'title' => 'Direct Hire',
                'icon' => 'handshake',
                'summary' => 'Permanent placements with a full search, assessment and post-placement support for long-term team members.',
                'features' => [
                    'Full-cycle search for permanent roles',
                    'Fee payable only on successful placement',
                    'Replacement guarantee period after start',
                    'Post-placement check-ins at 30, 60 and 90 days',
                ],
                'process_steps' => [
                    ['title' => 'Brief', 'description' => 'We agree role scope, compensation range and interview plan with the hiring manager.'],
                    ['title' => 'Search and screen', 'description' => 'We source, interview and shortlist candidates against the agreed scorecard.'],
                    ['title' => 'Interview and offer', 'description' => 'We coordinate interviews, gather feedback and support negotiation to a signed offer.'],
                    ['title' => 'Settle in', 'description' => 'We stay in touch with both sides through the first three months.'],
                ],
                'advantages' => [
                    ['title' => 'Aligned incentives', 'description' => 'We succeed only when you hire someone who stays and performs.'],
                    ['title' => 'Quality shortlists', 'description' => 'Candidates are vetted for skills, motivation and fit before you meet them.'],
                    ['title' => 'Lasting results', 'description' => 'A structured follow-up programme protects your investment.'],
                ],
                'body' => "## Hire for the long term\n\nDirect Hire is our full-service permanent placement model. We take responsibility for the entire search: defining the role with you, finding and assessing candidates, and guiding the offer to acceptance.\n\nYou only pay when you hire, and a replacement guarantee protects you if the placement does not work out within the agreed period.\n\n### Ideal for\n\n- Core engineering, data and product roles\n- Roles where culture and long-term growth matter\n- Teams that want a lasting partner rather than a transaction",
            ],
            [
                'slug' => 'contract',
                'title' => 'Contract',
                'icon' => 'file-text',
                'summary' => 'Project-based specialists for defined deliverables, with the option to convert to permanent employment.',
                'features' => [
                    'Contract and contract-to-hire engagements',
                    'Specialists for integrations, migrations and quality programmes',
                    'Compliance and contractor agreements handled by us',
                    'Conversion option with transparent terms',
                ],
                'process_steps' => [
                    ['title' => 'Scope', 'description' => 'We define deliverables, duration, tools and working hours with your project lead.'],
                    ['title' => 'Match', 'description' => 'We propose contractors who have delivered similar work in comparable environments.'],
                    ['title' => 'Engage', 'description' => 'We manage agreements, onboarding and timesheets.'],
                    ['title' => 'Convert or complete', 'description' => 'At the end of the project you can extend, convert to permanent or part ways cleanly.'],
                ],
                'advantages' => [
                    ['title' => 'Targeted expertise', 'description' => 'Bring in exactly the skill the project needs for as long as you need it.'],
                    ['title' => 'Lower overhead', 'description' => 'Avoid long-term headcount while you validate demand.'],
                    ['title' => 'Try before you hire', 'description' => 'Contract-to-hire lets both sides confirm the fit in real work.'],
                ],
                'body' => "## Specialist capacity for defined work\n\nIntegrations, data migrations, test automation or platform upgrades benefit from experienced specialists who can start quickly and deliver to a clear scope.\n\nOur Contract service provides vetted contractors and handles the administrative side, so your project lead can concentrate on delivery.\n\nWhen a contractor turns out to be exactly the person you want long term, our contract-to-hire option makes conversion straightforward.",
            ],
            [
                'slug' => 'payrolling',
                'title' => 'Payrolling',
                'icon' => 'wallet',
                'summary' => 'Employ the talent you found yourself without the administration: we become employer of record for payroll and compliance.',
                'features' => [
                    'Employer-of-record arrangements for individuals you select',
                    'Payroll, tax withholding and benefits administration',
                    'Contract and compliance management',
                    'Single monthly invoice with clear cost breakdown',
                ],
                'process_steps' => [
                    ['title' => 'Agree terms', 'description' => 'You select the person; we agree the rate, duration and administrative scope.'],
                    ['title' => 'Set up', 'description' => 'We issue the contract, run right-to-work checks and register payroll.'],
                    ['title' => 'Run', 'description' => 'We process payroll, taxes and statutory benefits each cycle.'],
                    ['title' => 'Report', 'description' => 'You receive one clear invoice and periodic cost reporting.'],
                ],
                'advantages' => [
                    ['title' => 'Less administration', 'description' => 'No payroll set-up or compliance overhead for short engagements.'],
                    ['title' => 'Lower compliance risk', 'description' => 'We stay current on employment and tax obligations.'],
                    ['title' => 'Speed to start', 'description' => 'People can start work quickly while formal arrangements are handled for you.'],
                ],
                'body' => "## Hire your own talent, skip the paperwork\n\nSometimes you already know who you want: a contractor from a previous project, a consultant referred by your team, or a specialist in a region where you have no legal entity.\n\nPayrolling lets us act as the employer of record. We handle contracts, payroll, taxes and statutory benefits, while you direct the work day to day.\n\nThis model is particularly useful for short engagements and for testing a new market before committing to an entity.",
            ],
            [
                'slug' => 'training',
                'title' => 'Training',
                'icon' => 'graduation-cap',
                'summary' => 'Upskilling and onboarding programmes that turn promising hires into productive supply chain technologists.',
                'features' => [
                    'Role-specific onboarding bootcamps',
                    'Retail and supply chain domain primers for engineers',
                    'Bridging programmes for career switchers',
                    'Skills assessments and learning plans',
                ],
                'process_steps' => [
                    ['title' => 'Assess', 'description' => 'We evaluate current skills against the role requirements to find the gaps.'],
                    ['title' => 'Design', 'description' => 'We build a focused learning plan combining domain knowledge, tooling and mentoring.'],
                    ['title' => 'Deliver', 'description' => 'Learners progress through hands-on sessions with experienced practitioners.'],
                    ['title' => 'Measure', 'description' => 'We track progress and report outcomes to managers.'],
                ],
                'advantages' => [
                    ['title' => 'Faster productivity', 'description' => 'New joiners reach full contribution sooner.'],
                    ['title' => 'Wider talent pool', 'description' => 'Hire promising people from adjacent fields and close the gap with training.'],
                    ['title' => 'Better retention', 'description' => 'Employees who see a growth path stay longer.'],
                ],
                'body' => "## Grow the talent you cannot easily hire\n\nThe retail supply chain industry has a limited pool of experienced technologists. Training widens that pool: engineers from other industries can become effective quickly with the right domain grounding, and new graduates can be productive sooner with structured onboarding.\n\nOur training programmes are shaped around real roles and delivered by practitioners. They connect closely with our *Mentorship* programmes for individuals and employers.",
            ],
        ];
    }
}
