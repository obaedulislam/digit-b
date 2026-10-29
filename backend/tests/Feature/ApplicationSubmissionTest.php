<?php

namespace Tests\Feature;

use App\Mail\ApplicationAcknowledgement;
use App\Mail\NewApplicationNotification;
use App\Models\Applicant;
use App\Models\Application;
use App\Models\ApplicationEvent;
use App\Models\JobPosting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApplicationSubmissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('private');
        Mail::fake();
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
            'email' => 'Ada@Example.com',
            'phone' => '+44 20 7946 0958',
            'location' => 'London, UK',
            'linkedin_url' => 'https://www.linkedin.com/in/ada',
            'current_title' => 'Software Engineer',
            'current_company' => 'Analytical Engines Ltd',
            'years_experience' => 6,
            'highest_education' => 'bachelor',
            'skills' => ['PHP', 'SQL'],
            'work_status' => 'remote',
            'expected_salary' => 90000,
            'cover_letter' => 'I would love to join.',
            'consent' => '1',
            'resume' => UploadedFile::fake()->create('My CV.pdf', 200, 'application/pdf'),
        ], $overrides);
    }

    public function test_submits_application_for_a_job(): void
    {
        $job = JobPosting::factory()->create(['slug' => 'software-engineer']);

        $response = $this->post('/api/v1/applications', $this->payload(['job' => 'software-engineer']), ['Accept' => 'application/json']);

        $response->assertCreated()->assertJsonStructure(['data' => ['id', 'message']]);

        $applicant = Applicant::query()->where('email', 'ada@example.com')->firstOrFail();
        $this->assertSame(['PHP', 'SQL'], $applicant->skills);

        $application = Application::query()->firstOrFail();
        $this->assertSame($job->id, $application->job_posting_id);
        $this->assertSame('new', $application->status->value);
        $this->assertSame('My CV.pdf', $application->resume_original_name);

        // Stored on the private disk under a random name (not the client's name).
        Storage::disk('private')->assertExists($application->resume_path);
        $this->assertStringStartsWith('resumes/', $application->resume_path);
        $this->assertStringNotContainsString('CV', $application->resume_path);
        $this->assertMatchesRegularExpression('#^resumes/\d{4}/\d{2}/[A-Za-z0-9]{40}\.pdf$#', $application->resume_path);

        $this->assertDatabaseHas('application_events', ['application_id' => $application->id, 'type' => 'created', 'to_status' => 'new']);

        Mail::assertQueued(ApplicationAcknowledgement::class, fn ($m) => $m->hasTo('ada@example.com'));
        Mail::assertQueued(NewApplicationNotification::class, fn ($m) => $m->hasTo('inbox@digit-b.test'));
    }

    public function test_general_talent_pool_application_without_job_and_comma_skills(): void
    {
        $this->post('/api/v1/applications', $this->payload(['skills' => 'PHP, SQL , Docker']), ['Accept' => 'application/json'])->assertCreated();

        $this->assertNull(Application::query()->first()->job_posting_id);
        $this->assertSame(['PHP', 'SQL', 'Docker'], Applicant::query()->first()->skills);
    }

    public function test_same_applicant_is_upserted_by_lowercase_email(): void
    {
        JobPosting::factory()->create(['slug' => 'job-a']);
        JobPosting::factory()->create(['slug' => 'job-b']);

        $this->post('/api/v1/applications', $this->payload(['job' => 'job-a']), ['Accept' => 'application/json'])->assertCreated();
        $this->post('/api/v1/applications', $this->payload(['job' => 'job-b', 'email' => 'ADA@example.com', 'first_name' => 'Augusta', 'resume' => UploadedFile::fake()->create('cv.pdf', 10, 'application/pdf')]), ['Accept' => 'application/json'])->assertCreated();

        $this->assertSame(1, Applicant::query()->count());
        $this->assertSame('Augusta', Applicant::query()->first()->first_name);
        $this->assertSame(2, Application::query()->count());
    }

    public function test_validation_errors(): void
    {
        $response = $this->postJson('/api/v1/applications', []);

        $response->assertUnprocessable()->assertJsonValidationErrors([
            'first_name', 'last_name', 'email', 'phone', 'location', 'current_title', 'years_experience', 'highest_education', 'work_status', 'resume', 'consent',
        ])->assertJsonStructure(['message', 'errors']);

        $this->post('/api/v1/applications', $this->payload([
            'email' => 'nope', 'phone' => 'abc', 'years_experience' => 99, 'highest_education' => 'phd', 'work_status' => 'moon',
            'available_from' => now()->subDay()->toDateString(), 'consent' => '0', 'linkedin_url' => 'javascript:alert(1)',
            'skills' => array_fill(0, 16, 'x'), 'job' => 'does-not-exist',
        ]), ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors([
            'email', 'phone', 'years_experience', 'highest_education', 'work_status', 'available_from', 'consent', 'linkedin_url', 'skills', 'job',
        ]);

        $this->assertDatabaseCount('applications', 0);
    }

    public function test_cannot_apply_to_unpublished_or_closed_job(): void
    {
        JobPosting::factory()->draft()->create(['slug' => 'draft-job']);
        JobPosting::factory()->expired()->create(['slug' => 'expired-job']);

        foreach (['draft-job', 'expired-job'] as $slug) {
            $this->post('/api/v1/applications', $this->payload(['job' => $slug]), ['Accept' => 'application/json'])
                ->assertUnprocessable()->assertJsonValidationErrors(['job']);
        }
    }

    public function test_rejects_bad_mime_extension_and_oversized_resume(): void
    {
        $cases = [
            'exe disguised' => UploadedFile::fake()->create('cv.exe', 10, 'application/x-msdownload'),
            'wrong mime' => UploadedFile::fake()->create('cv.pdf', 10, 'text/plain'),
            'php file' => UploadedFile::fake()->create('shell.php', 10, 'application/x-php'),
            'too big' => UploadedFile::fake()->create('big.pdf', 6000, 'application/pdf'),
        ];

        foreach ($cases as $label => $file) {
            $this->post('/api/v1/applications', $this->payload(['resume' => $file, 'email' => md5($label).'@example.com']), ['Accept' => 'application/json'])
                ->assertUnprocessable()->assertJsonValidationErrors(['resume']);
        }

        $this->assertDatabaseCount('applications', 0);
        $this->assertSame([], Storage::disk('private')->allFiles());
    }

    public function test_duplicate_application_to_same_job_within_30_days_is_rejected(): void
    {
        JobPosting::factory()->create(['slug' => 'dup-job']);

        $this->post('/api/v1/applications', $this->payload(['job' => 'dup-job']), ['Accept' => 'application/json'])->assertCreated();

        $this->post('/api/v1/applications', $this->payload(['job' => 'dup-job', 'resume' => UploadedFile::fake()->create('cv2.pdf', 10, 'application/pdf')]), ['Accept' => 'application/json'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);

        $this->assertSame(1, Application::query()->count());
        $this->assertCount(1, Storage::disk('private')->allFiles(), 'rejected duplicate must not leave a file behind');

        // After 30 days the same person can apply again.
        Application::query()->update(['created_at' => now()->subDays(31)]);
        $this->post('/api/v1/applications', $this->payload(['job' => 'dup-job', 'resume' => UploadedFile::fake()->create('cv3.pdf', 10, 'application/pdf')]), ['Accept' => 'application/json'])->assertCreated();
    }

    public function test_honeypot_returns_success_but_stores_nothing(): void
    {
        $this->post('/api/v1/applications', $this->payload(['website' => 'http://spam.example']), ['Accept' => 'application/json'])
            ->assertCreated()->assertJsonPath('data.id', 0);

        $this->assertDatabaseCount('applicants', 0);
        $this->assertDatabaseCount('applications', 0);
        $this->assertSame([], Storage::disk('private')->allFiles());
        Mail::assertNothingQueued();
    }

    public function test_failure_inside_the_transaction_rolls_everything_back_and_removes_file(): void
    {
        ApplicationEvent::creating(function () {
            throw new \RuntimeException('boom');
        });

        $this->post('/api/v1/applications', $this->payload(), ['Accept' => 'application/json'])
            ->assertStatus(500)->assertExactJson(['message' => 'Server Error']);

        $this->assertDatabaseCount('applicants', 0);
        $this->assertDatabaseCount('applications', 0);
        $this->assertDatabaseCount('application_events', 0);
        $this->assertSame([], Storage::disk('private')->allFiles());
        Mail::assertNothingQueued();
    }

    public function test_mail_failure_does_not_fail_the_request(): void
    {
        Mail::shouldReceive('to')->andThrow(new \RuntimeException('SMTP down'));

        $this->post('/api/v1/applications', $this->payload(), ['Accept' => 'application/json'])->assertCreated();

        $this->assertDatabaseCount('applications', 1);
    }

    public function test_forms_are_rate_limited_to_five_per_minute(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/newsletter', ['email' => "user{$i}@example.com"])->assertSuccessful();
        }

        $this->postJson('/api/v1/newsletter', ['email' => 'user6@example.com'])->assertStatus(429);
    }
}
