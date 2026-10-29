<?php

namespace Database\Seeders;

use App\Enums\EmploymentType;
use App\Enums\JobStatus;
use App\Enums\WorkMode;
use App\Models\JobPosting;
use Illuminate\Database\Seeder;

/**
 * The seven vacancies carried over from the legacy site (titles, types,
 * locations and salaries preserved) with full professional descriptions.
 */
class JobSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->jobs() as $job) {
            $status = $job['status'] ?? JobStatus::Published;
            $postedDaysAgo = $job['posted_days_ago'];
            unset($job['status'], $job['posted_days_ago']);

            JobPosting::query()->updateOrCreate(['slug' => $job['slug']], $job + [
                'status' => $status->value,
                'published_at' => $status === JobStatus::Published ? now()->subDays($postedDaysAgo) : null,
                'salary_currency' => 'USD',
                'salary_period' => 'year',
                'seo_title' => $job['title'].' – '.$job['location'].' | DIGIT-B',
                'seo_description' => $job['summary'],
            ]);
        }
    }

    /** @return list<array<string, mixed>> */
    private function jobs(): array
    {
        $benefits = [
            'Competitive salary reviewed annually',
            'Flexible hybrid working arrangements',
            'Paid annual leave and public holidays',
            'Learning budget for certifications and conferences',
            'Health and wellbeing support',
        ];

        return [
            [
                'slug' => 'software-engineer',
                'title' => 'Software Engineer',
                'reference_code' => '2019ER',
                'employment_type' => EmploymentType::ContractToHire->value,
                'work_mode' => WorkMode::Hybrid->value,
                'location' => 'County Wexford, Ireland',
                'country' => 'Ireland',
                'department' => 'Engineering',
                'salary_min' => 85000,
                'salary_max' => 90000,
                'show_salary' => true,
                'experience_min' => 3,
                'experience_max' => 5,
                'is_featured' => true,
                'posted_days_ago' => 3,
                'summary' => 'Build and extend order, inventory and fulfilment services for a retail supply chain platform used across multiple regions.',
                'description_markdown' => "## About the role\n\nOur client operates a retail supply chain platform that connects stores, warehouses and carriers. They are hiring a Software Engineer to join a product team responsible for order orchestration and inventory availability services.\n\nThis is a contract-to-hire position: an initial six-month engagement with a clear path to a permanent contract for the right person.\n\n## About the team\n\nYou will work with a product manager, two other engineers and a QA specialist. The team practises trunk-based development, automated testing and weekly releases.",
                'responsibilities' => [
                    'Design, build and maintain back-end services for order and inventory workflows',
                    'Integrate with warehouse management, carrier and ERP systems through APIs and events',
                    'Write automated unit and integration tests and keep pipelines green',
                    'Investigate production incidents and contribute to post-incident improvements',
                    'Take part in code reviews and share knowledge with teammates',
                    'Work with product and operations to turn business rules into reliable software',
                ],
                'requirements' => [
                    '3 to 5 years of professional back-end software development experience',
                    'Strong skills in a modern language such as Java, C#, Node.js or PHP',
                    'Solid understanding of REST APIs, relational databases and SQL',
                    'Experience with automated testing and CI/CD',
                    'Clear written and spoken English',
                ],
                'nice_to_have' => [
                    'Experience with retail, e-commerce or logistics systems',
                    'Familiarity with message queues or event-driven architecture',
                    'Cloud experience (AWS or Azure)',
                ],
                'benefits' => $benefits,
            ],
            [
                'slug' => 'project-manager',
                'title' => 'Project Manager',
                'employment_type' => EmploymentType::DirectHire->value,
                'work_mode' => WorkMode::Hybrid->value,
                'location' => 'County Wexford, Ireland',
                'country' => 'Ireland',
                'department' => 'Project Delivery',
                'salary_min' => 85000,
                'salary_max' => 90000,
                'show_salary' => true,
                'experience_min' => 5,
                'experience_max' => 8,
                'is_featured' => true,
                'posted_days_ago' => 5,
                'summary' => 'Lead the delivery of retail supply chain technology programmes, from planning through go-live, for a growing client portfolio.',
                'description_markdown' => "## About the role\n\nWe are recruiting a Project Manager for a technology company delivering warehouse, transport and store-replenishment solutions to retailers. You will own delivery of implementation projects from kick-off to hypercare.\n\nThis is a permanent, direct-hire position with a strong emphasis on client communication and structured delivery.\n\n## What success looks like\n\nProjects delivered on scope, on time and with a client who would recommend the team.",
                'responsibilities' => [
                    'Plan and manage end-to-end delivery of software implementation projects',
                    'Maintain scope, schedule, budget and risk registers, and report status to stakeholders',
                    'Coordinate engineers, analysts, testers and client teams across time zones',
                    'Run governance meetings, steering committees and go-live readiness reviews',
                    'Manage change requests and protect delivery quality',
                    'Capture lessons learned and improve the delivery playbook',
                ],
                'requirements' => [
                    '5 to 8 years of project management experience in software delivery',
                    'Track record delivering enterprise implementations with multiple stakeholders',
                    'Strong command of agile and waterfall delivery approaches',
                    'Excellent stakeholder communication and negotiation skills',
                    'PMP, PRINCE2 or equivalent is an advantage',
                ],
                'nice_to_have' => [
                    'Experience in retail, warehouse or transport management systems',
                    'Experience leading data migration and integration projects',
                    'Scrum Master or SAFe certification',
                ],
                'benefits' => $benefits,
            ],
            [
                'slug' => 'manager',
                'title' => 'Manager',
                'employment_type' => EmploymentType::ContractToHire->value,
                'work_mode' => WorkMode::Hybrid->value,
                'location' => 'Dhaka, Bangladesh',
                'country' => 'Bangladesh',
                'department' => 'Operations',
                'salary_min' => 30000,
                'salary_max' => 40000,
                'show_salary' => true,
                'experience_min' => 2,
                'experience_max' => 3,
                'is_featured' => true,
                'posted_days_ago' => 8,
                'summary' => 'Manage day-to-day delivery operations for a retail technology support team, with a path to a permanent management role.',
                'description_markdown' => "## About the role\n\nWe are looking for an operations-minded Manager to lead a small team supporting retail technology clients. You will make sure service levels are met, work is prioritised sensibly and the team has the tools and clarity it needs.\n\nThe position starts as a contract-to-hire engagement with conversion to permanent employment after a successful review.",
                'responsibilities' => [
                    'Lead and coach a team of support and delivery specialists',
                    'Monitor service-level agreements and drive improvements',
                    'Plan workload, schedules and capacity across the team',
                    'Act as escalation point for client and internal stakeholders',
                    'Prepare weekly and monthly performance reports',
                    'Improve processes, documentation and knowledge sharing',
                ],
                'requirements' => [
                    '2 to 3 years of experience managing or leading a team',
                    'Strong organisational and prioritisation skills',
                    'Comfortable with reporting, metrics and service-level management',
                    'Excellent communication skills in English',
                    'Bachelor degree in business, IT or a related field',
                ],
                'nice_to_have' => [
                    'Experience in IT service management (ITIL)',
                    'Exposure to retail or supply chain operations',
                ],
                'benefits' => $benefits,
            ],
            [
                'slug' => 'sqa-engineer',
                'title' => 'SQA Engineer',
                'employment_type' => EmploymentType::Contract->value,
                'work_mode' => WorkMode::Onsite->value,
                'location' => 'Dhaka, Bangladesh',
                'country' => 'Bangladesh',
                'department' => 'Quality Assurance',
                'salary_min' => 20000,
                'salary_max' => 30000,
                'show_salary' => true,
                'experience_min' => 2,
                'experience_max' => 4,
                'is_featured' => false,
                'posted_days_ago' => 10,
                'summary' => 'Ensure the quality of retail supply chain applications through manual and automated testing across web and API layers.',
                'description_markdown' => "## About the role\n\nWe are hiring a Software Quality Assurance Engineer on a contract basis to support releases of a retail supply chain platform. You will design test cases, automate regression suites and work closely with developers to catch problems before customers do.",
                'responsibilities' => [
                    'Analyse requirements and design test plans and test cases',
                    'Execute functional, regression and exploratory testing',
                    'Build and maintain automated UI and API test suites',
                    'Log, triage and track defects through to resolution',
                    'Validate releases in staging and support production smoke testing',
                    'Contribute to continuous integration quality gates',
                ],
                'requirements' => [
                    '2 to 4 years of experience in software quality assurance',
                    'Hands-on experience with test automation tools such as Selenium, Cypress or Playwright',
                    'Experience testing REST APIs with Postman or similar tools',
                    'Good understanding of the software development life cycle',
                    'Attention to detail and a clear way of reporting issues',
                ],
                'nice_to_have' => [
                    'Experience with performance testing (JMeter, k6)',
                    'Knowledge of SQL for data validation',
                    'ISTQB certification',
                ],
                'benefits' => [
                    'Competitive contract rate',
                    'Possibility of extension or conversion',
                    'Exposure to enterprise retail technology',
                    'Supportive, collaborative team',
                ],
            ],
            [
                'slug' => 'software-engineer-2',
                'title' => 'Software Engineer',
                'employment_type' => EmploymentType::FullTime->value,
                'work_mode' => WorkMode::Hybrid->value,
                'location' => 'Dhaka, Bangladesh',
                'country' => 'Bangladesh',
                'department' => 'Engineering',
                'show_salary' => false,
                'experience_min' => 2,
                'experience_max' => 5,
                'is_featured' => false,
                'posted_days_ago' => 14,
                'summary' => 'Join a product engineering team building web applications for retail, warehouse and last-mile delivery operations.',
                'description_markdown' => "## About the role\n\nA technology company serving retail and logistics customers is expanding its Dhaka engineering team. As a Software Engineer you will build features end to end: from database design and APIs to the web interfaces used by operations staff every day.\n\nYou will receive mentorship from senior engineers and real ownership of your work.",
                'responsibilities' => [
                    'Develop and maintain web applications and APIs',
                    'Translate user stories into well-tested, maintainable code',
                    'Participate in design discussions and code reviews',
                    'Troubleshoot and fix defects reported by support teams',
                    'Document technical decisions and keep runbooks current',
                ],
                'requirements' => [
                    '2 to 5 years of software development experience',
                    'Proficiency in at least one back-end language and one modern front-end framework',
                    'Good knowledge of relational databases',
                    'Familiarity with Git and collaborative workflows',
                    'Willingness to learn the retail supply chain domain',
                ],
                'nice_to_have' => [
                    'Experience with Docker and CI/CD',
                    'Interest in data-intensive or real-time systems',
                ],
                'benefits' => $benefits,
            ],
            [
                'slug' => 'accountant',
                'title' => 'Accountant',
                'employment_type' => EmploymentType::FullTime->value,
                'work_mode' => WorkMode::Onsite->value,
                'location' => 'Dhaka, Bangladesh',
                'country' => 'Bangladesh',
                'department' => 'Finance',
                'show_salary' => false,
                'experience_min' => 2,
                'experience_max' => 5,
                'is_featured' => false,
                'posted_days_ago' => 18,
                'summary' => 'Maintain accurate financial records, reporting and compliance for a growing technology services business.',
                'description_markdown' => "## About the role\n\nWe are recruiting an Accountant to support the finance function of a technology services company. You will own day-to-day bookkeeping, month-end close and statutory reporting, and provide clear numbers to the leadership team.",
                'responsibilities' => [
                    'Maintain the general ledger and reconcile accounts monthly',
                    'Process accounts payable and receivable and follow up on collections',
                    'Prepare monthly management reports and variance analysis',
                    'Support budgeting, forecasting and audit preparation',
                    'Ensure tax and regulatory filings are accurate and on time',
                ],
                'requirements' => [
                    'Bachelor degree in accounting, finance or similar',
                    '2 to 5 years of accounting experience',
                    'Proficiency with accounting software and advanced spreadsheet skills',
                    'Strong understanding of local tax and compliance requirements',
                    'High accuracy and integrity',
                ],
                'nice_to_have' => [
                    'Professional qualification (ACCA, CA, CMA) or progress towards one',
                    'Experience in a services or technology business',
                ],
                'benefits' => $benefits,
            ],
            [
                'slug' => 'people-manager-4',
                'title' => 'People Manager',
                'employment_type' => EmploymentType::FullTime->value,
                'work_mode' => WorkMode::Hybrid->value,
                'location' => 'County Wexford, Ireland',
                'country' => 'Ireland',
                'department' => 'People & Culture',
                'show_salary' => false,
                'experience_min' => 5,
                'experience_max' => 8,
                'is_featured' => false,
                'status' => JobStatus::Draft,
                'posted_days_ago' => 0,
                'summary' => 'Lead recruitment, onboarding and employee development for a growing technology organisation (unlisted draft).',
                'description_markdown' => "## About the role\n\nA growing technology organisation is looking for a People Manager to build its people function: hiring, onboarding, performance and development. This role is currently unlisted and held as a draft.",
                'responsibilities' => [
                    'Own the end-to-end recruitment and onboarding process',
                    'Partner with managers on performance and development',
                    'Maintain HR policies and compliance',
                    'Run engagement surveys and act on the results',
                ],
                'requirements' => [
                    '5 to 8 years of HR or people management experience',
                    'Experience supporting technology teams',
                    'Strong knowledge of employment law and best practice',
                    'Excellent interpersonal skills',
                ],
                'nice_to_have' => ['CIPD or equivalent qualification', 'Experience scaling teams quickly'],
                'benefits' => $benefits,
            ],
        ];
    }
}
