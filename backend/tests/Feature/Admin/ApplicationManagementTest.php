<?php

namespace Tests\Feature\Admin;

use App\Models\Applicant;
use App\Models\Application;
use App\Models\ContactInquiry;
use App\Models\JobPosting;
use App\Models\MentorshipProgram;
use App\Models\MentorshipRequest;
use App\Models\NewsletterSubscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApplicationManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('private');
    }

    public function test_list_filters_and_detail(): void
    {
        $user = $this->actingAsRole('recruiter');
        $jobA = JobPosting::factory()->create(['slug' => 'job-a']);
        $jobB = JobPosting::factory()->create(['slug' => 'job-b']);
        $ada = Applicant::factory()->create(['first_name' => 'Ada', 'last_name' => 'Lovelace', 'email' => 'ada@example.com']);
        $bob = Applicant::factory()->create(['first_name' => 'Bob', 'last_name' => 'Builder']);
        $a1 = Application::factory()->create(['applicant_id' => $ada->id, 'job_posting_id' => $jobA->id, 'status' => 'new', 'created_at' => now()->subDays(10)]);
        Application::factory()->create(['applicant_id' => $bob->id, 'job_posting_id' => $jobB->id, 'status' => 'reviewing']);

        $this->getJson('/api/v1/admin/applications')->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('meta.total', 2);
        $this->getJson('/api/v1/admin/applications?status=reviewing')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/admin/applications?job=job-a')->assertJsonCount(1, 'data')->assertJsonPath('data.0.applicant.full_name', 'Ada Lovelace');
        $this->getJson('/api/v1/admin/applications?job='.$jobB->id)->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/admin/applications?search=lovelace')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/admin/applications?date_from='.now()->subDays(2)->toDateString())->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/admin/applications?date_to='.now()->subDays(5)->toDateString())->assertJsonCount(1, 'data');

        $this->getJson("/api/v1/admin/applications/{$a1->id}")->assertOk()
            ->assertJsonPath('data.applicant.email', 'ada@example.com')
            ->assertJsonPath('data.job.slug', 'job-a')
            ->assertJsonPath('data.resume.download_url', "/api/v1/admin/applications/{$a1->id}/resume")
            ->assertJsonStructure(['data' => ['events', 'cover_letter', 'notes', 'expected_salary']]);
        $this->assertNotNull($user);
    }

    public function test_status_change_writes_an_event_with_the_actor(): void
    {
        $user = $this->actingAsRole('recruiter');
        $application = Application::factory()->create();

        $response = $this->patchJson("/api/v1/admin/applications/{$application->id}", ['status' => 'shortlisted', 'notes' => 'Strong profile'])->assertOk()
            ->assertJsonPath('data.status', 'shortlisted')->assertJsonPath('data.notes', 'Strong profile');

        $this->assertDatabaseHas('application_events', [
            'application_id' => $application->id, 'type' => 'status_changed', 'from_status' => 'new', 'to_status' => 'shortlisted', 'user_id' => $user->id,
        ]);
        $this->assertDatabaseHas('application_events', ['application_id' => $application->id, 'type' => 'note_updated', 'note' => 'Strong profile']);
        $this->assertCount(2, $response->json('data.events'));

        // Same status again: no new event.
        $this->patchJson("/api/v1/admin/applications/{$application->id}", ['status' => 'shortlisted'])->assertOk();
        $this->assertSame(2, $application->events()->count());

        $this->patchJson("/api/v1/admin/applications/{$application->id}", ['status' => 'teleported'])->assertUnprocessable()->assertJsonValidationErrors(['status']);
    }

    public function test_resume_download_requires_permission_and_streams_the_file(): void
    {
        Storage::disk('private')->put('resumes/2026/01/abc.pdf', '%PDF-1.4 fake');
        $applicant = Applicant::factory()->create(['first_name' => 'Ada', 'last_name' => 'Lovelace']);
        $application = Application::factory()->create(['applicant_id' => $applicant->id, 'resume_path' => 'resumes/2026/01/abc.pdf']);
        $url = "/api/v1/admin/applications/{$application->id}/resume";

        $this->getJson($url)->assertUnauthorized();

        $this->actingAsRole('editor');
        $this->getJson($url)->assertForbidden();

        $this->app['auth']->forgetGuards();
        $this->actingAsRole('recruiter');
        $response = $this->get($url)->assertOk();
        $this->assertStringContainsString('ada-lovelace-resume.pdf', $response->headers->get('Content-Disposition'));
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertSame('%PDF-1.4 fake', $response->streamedContent());
    }

    public function test_resume_download_404_when_file_missing(): void
    {
        $this->actingAsRole('recruiter');
        $application = Application::factory()->create(['resume_path' => 'resumes/missing.pdf']);

        $this->getJson("/api/v1/admin/applications/{$application->id}/resume")->assertNotFound();
    }

    public function test_csv_export_neutralises_formula_injection(): void
    {
        $this->actingAsRole('recruiter');
        $evil = Applicant::factory()->create([
            'first_name' => '=HYPERLINK("http://evil","x")', 'last_name' => '+cmd|calc', 'email' => 'e@example.com',
            'current_title' => '@SUM(A1)', 'current_company' => '-2+3', 'location' => 'Normal City',
        ]);
        Application::factory()->create(['applicant_id' => $evil->id]);

        $response = $this->get('/api/v1/admin/applications/export')->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $csv = $response->streamedContent();

        $this->assertStringContainsString("'=HYPERLINK", $csv);
        $this->assertStringContainsString("'+cmd|calc", $csv);
        $this->assertStringContainsString("'@SUM(A1)", $csv);
        $this->assertStringContainsString("'-2+3", $csv);
        $this->assertStringNotContainsString(',=HYPERLINK', $csv);
        $this->assertStringContainsString('Normal City', $csv);
        $this->assertStringStartsWith("\xEF\xBB\xBFID,", $csv);
    }

    public function test_export_honours_filters(): void
    {
        $this->actingAsRole('recruiter');
        Application::factory()->create(['status' => 'hired']);
        Application::factory()->create(['status' => 'new']);

        $csv = $this->get('/api/v1/admin/applications/export?status=hired')->streamedContent();

        $this->assertSame(2, count(array_filter(explode("\n", trim($csv)))), 'header + 1 row');
    }

    public function test_delete_application(): void
    {
        $this->actingAsRole('recruiter');
        $application = Application::factory()->create();

        $this->deleteJson("/api/v1/admin/applications/{$application->id}")->assertNoContent();
        $this->assertSoftDeleted('applications', ['id' => $application->id]);
    }

    public function test_inquiries_mentorship_requests_and_subscribers(): void
    {
        $this->actingAsRole('recruiter');
        $inquiry = ContactInquiry::factory()->create();
        ContactInquiry::factory()->create(['status' => 'archived', 'inquiry_type' => 'general']);
        $program = MentorshipProgram::factory()->create();
        $request = MentorshipRequest::query()->create(['mentorship_program_id' => $program->id, 'name' => 'Sam', 'email' => 's@example.com', 'goal' => 'Move into the industry.']);
        $subscriber = NewsletterSubscriber::factory()->create(['email' => '=evil@example.com']);
        NewsletterSubscriber::factory()->create(['unsubscribed_at' => now()]);

        $this->getJson('/api/v1/admin/inquiries?status=new')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/admin/inquiries?inquiry_type=general')->assertJsonCount(1, 'data');
        $this->patchJson("/api/v1/admin/inquiries/{$inquiry->id}", ['status' => 'replied', 'notes' => 'Called back'])->assertOk()->assertJsonPath('data.status', 'replied');
        $this->patchJson("/api/v1/admin/inquiries/{$inquiry->id}", ['status' => 'bogus'])->assertUnprocessable();
        $this->deleteJson("/api/v1/admin/inquiries/{$inquiry->id}")->assertNoContent();

        $this->getJson("/api/v1/admin/mentorship-requests/{$request->id}")->assertOk()->assertJsonPath('data.program.slug', $program->slug);
        $this->patchJson("/api/v1/admin/mentorship-requests/{$request->id}", ['status' => 'read'])->assertOk();
        $this->deleteJson("/api/v1/admin/mentorship-requests/{$request->id}")->assertNoContent();

        $this->getJson('/api/v1/admin/subscribers?status=active')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/admin/subscribers?status=unsubscribed')->assertJsonCount(1, 'data');
        $csv = $this->get('/api/v1/admin/subscribers/export')->streamedContent();
        $this->assertStringContainsString("'=evil@example.com", $csv);
        $this->deleteJson("/api/v1/admin/subscribers/{$subscriber->id}")->assertNoContent();
    }
}
