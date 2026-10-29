<?php

namespace Database\Seeders;

use App\Enums\ApplicationStatus;
use App\Models\Applicant;
use App\Models\Application;
use App\Models\ApplicationEvent;
use App\Models\ContactInquiry;
use App\Models\JobPosting;
use App\Models\MentorshipProgram;
use App\Models\MentorshipRequest;
use App\Models\NewsletterSubscriber;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Local development only (see DatabaseSeeder): demo staff users with a known
 * password, plus a handful of sample submissions so the dashboard has data.
 */
class LocalDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->demoUser('Demo Editor', 'editor@digit-b.test', 'editor');
        $this->demoUser('Demo Recruiter', 'recruiter@digit-b.test', 'recruiter');
        $this->command?->info('Demo users: editor@digit-b.test / recruiter@digit-b.test (password: "password")');

        if (Application::query()->exists()) {
            return;
        }

        $jobs = JobPosting::query()->open()->get();
        $statuses = [ApplicationStatus::New, ApplicationStatus::New, ApplicationStatus::Reviewing, ApplicationStatus::Shortlisted, ApplicationStatus::Interview, ApplicationStatus::Rejected];

        $resumes = Storage::disk(config('digitb.resume_disk'));

        foreach ($statuses as $i => $status) {
            // A real (tiny) PDF so "Download résumé" works in the demo admin.
            $resumes->put('resumes/demo/sample-'.$i.'.pdf', self::placeholderPdf("Sample resume {$i} (demo data)"));

            $applicant = Applicant::factory()->create(['email' => "candidate{$i}@example.test"]);
            $application = Application::query()->create([
                'applicant_id' => $applicant->id,
                'job_posting_id' => $jobs->get($i % max($jobs->count(), 1))?->id,
                'status' => $status->value,
                'work_status' => 'hybrid',
                'resume_path' => 'resumes/demo/sample-'.$i.'.pdf',
                'resume_original_name' => 'resume.pdf',
                'resume_mime' => 'application/pdf',
                'resume_size' => $resumes->size('resumes/demo/sample-'.$i.'.pdf'),
                'consented_at' => now(),
                'created_at' => now()->subDays($i * 2),
                'updated_at' => now()->subDays($i * 2),
            ]);
            ApplicationEvent::query()->create([
                'application_id' => $application->id,
                'type' => ApplicationEvent::TYPE_CREATED,
                'to_status' => ApplicationStatus::New->value,
                'note' => 'Application submitted via website.',
            ]);
        }

        ContactInquiry::factory()->count(3)->create();

        MentorshipRequest::query()->create([
            'mentorship_program_id' => MentorshipProgram::query()->where('slug', 'career-switch')->value('id'),
            'name' => 'Sample Learner',
            'email' => 'learner@example.test',
            'current_role' => 'Retail store analyst',
            'goal' => 'I want to move into supply chain software testing within a year.',
            'consented_at' => now(),
        ]);

        foreach (['alex@example.test', 'sam@example.test', 'riley@example.test'] as $email) {
            NewsletterSubscriber::query()->firstOrCreate(['email' => $email], [
                'unsubscribe_token' => Str::random(64),
                'subscribed_at' => now(),
            ]);
        }
    }

    /** Smallest well-formed single-page PDF carrying one line of (ASCII) text. */
    private static function placeholderPdf(string $text): string
    {
        $text = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);
        $stream = "BT /F1 18 Tf 72 720 Td ({$text}) Tj ET";
        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
            '<< /Length '.strlen($stream)." >>\nstream\n{$stream}\nendstream",
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objects as $i => $body) {
            $offsets[] = strlen($pdf);
            $pdf .= ($i + 1)." 0 obj\n{$body}\nendobj\n";
        }

        $xref = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        foreach ($offsets as $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }

        return $pdf."trailer\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF\n";
    }

    private function demoUser(string $name, string $email, string $role): void
    {
        $user = User::query()->firstOrCreate(['email' => $email], ['name' => $name, 'password' => 'password']);
        $user->syncRoles([$role]);
    }
}
