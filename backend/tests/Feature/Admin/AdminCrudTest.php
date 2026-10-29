<?php

namespace Tests\Feature\Admin;

use App\Models\Faq;
use App\Models\JobPosting;
use App\Models\MentorshipProgram;
use App\Models\PostCategory;
use App\Models\Service;
use App\Models\Testimonial;
use App\Services\SiteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminCrudTest extends TestCase
{
    use RefreshDatabase;

    private function jobPayload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Senior QA Engineer',
            'employment_type' => 'contract',
            'work_mode' => 'remote',
            'location' => 'Columbus, Ohio',
            'summary' => 'Quality engineering for retail supply chain.',
            'description_markdown' => "## About\n\nGreat role.",
            'responsibilities' => ['Test things'],
            'salary_min' => 70000,
            'salary_max' => 80000,
            'status' => 'published',
        ], $overrides);
    }

    public function test_jobs_crud_flow(): void
    {
        $this->actingAsRole('recruiter');

        $created = $this->postJson('/api/v1/admin/jobs', $this->jobPayload())->assertCreated()
            ->assertJsonPath('data.slug', 'senior-qa-engineer')
            ->assertJsonPath('data.status', 'published')
            ->assertJsonPath('data.salary_display', '$70,000 – $80,000 / year');
        $id = $created->json('data.id');
        $this->assertNotNull($created->json('data.published_at'), 'publishing sets published_at');

        $this->getJson("/api/v1/admin/jobs/{$id}")->assertOk()->assertJsonPath('data.title', 'Senior QA Engineer');

        $this->patchJson("/api/v1/admin/jobs/{$id}", ['title' => 'Lead QA Engineer', 'status' => 'closed'])->assertOk()
            ->assertJsonPath('data.title', 'Lead QA Engineer')->assertJsonPath('data.status', 'closed');

        // Slug is preserved on update; a closed job disappears from the public API.
        $this->assertSame('senior-qa-engineer', JobPosting::find($id)->slug);
        $this->getJson('/api/v1/jobs/senior-qa-engineer')->assertNotFound();

        $this->deleteJson("/api/v1/admin/jobs/{$id}")->assertNoContent();
        $this->assertSoftDeleted('job_postings', ['id' => $id]);
        $this->getJson("/api/v1/admin/jobs/{$id}")->assertNotFound();
    }

    public function test_job_validation_slug_uniqueness_and_ranges(): void
    {
        $this->actingAsRole('recruiter');
        JobPosting::factory()->create(['slug' => 'taken']);

        $this->postJson('/api/v1/admin/jobs', [])->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'employment_type', 'work_mode', 'location', 'summary', 'description_markdown']);
        $this->postJson('/api/v1/admin/jobs', $this->jobPayload(['slug' => 'taken']))->assertJsonValidationErrors(['slug']);
        $this->postJson('/api/v1/admin/jobs', $this->jobPayload(['salary_min' => 100, 'salary_max' => 50]))->assertJsonValidationErrors(['salary_max']);
        $this->postJson('/api/v1/admin/jobs', $this->jobPayload(['employment_type' => 'gig']))->assertJsonValidationErrors(['employment_type']);
        $this->postJson('/api/v1/admin/jobs', $this->jobPayload(['status' => 'weird']))->assertJsonValidationErrors(['status']);
    }

    public function test_job_auto_slug_is_unique_and_duplicate_creates_draft_copy(): void
    {
        $this->actingAsRole('recruiter');
        $this->postJson('/api/v1/admin/jobs', $this->jobPayload())->assertCreated();
        $second = $this->postJson('/api/v1/admin/jobs', $this->jobPayload())->assertCreated();
        $this->assertSame('senior-qa-engineer-2', $second->json('data.slug'));

        $copy = $this->postJson('/api/v1/admin/jobs/'.$second->json('data.id').'/duplicate')->assertCreated()
            ->assertJsonPath('data.status', 'draft')->assertJsonPath('data.title', 'Senior QA Engineer (Copy)')
            ->assertJsonPath('data.published_at', null);
        $this->assertSame('senior-qa-engineer-2-copy', $copy->json('data.slug'));
    }

    public function test_job_list_supports_filters_search_sort_and_pagination(): void
    {
        $this->actingAsRole('recruiter');
        JobPosting::factory()->create(['title' => 'Alpha Role', 'status' => 'published']);
        JobPosting::factory()->draft()->create(['title' => 'Beta Role']);
        JobPosting::factory()->create(['title' => 'Gamma Role', 'status' => 'published']);

        $this->getJson('/api/v1/admin/jobs?status=draft')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/admin/jobs?search=gamma')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/admin/jobs?sort=title')->assertJsonPath('data.0.title', 'Alpha Role');
        $this->getJson('/api/v1/admin/jobs?sort=-title')->assertJsonPath('data.0.title', 'Gamma Role');
        $this->getJson('/api/v1/admin/jobs?sort=password;drop')->assertOk(); // not in the allow-list: ignored
        $this->getJson('/api/v1/admin/jobs?per_page=2')->assertJsonCount(2, 'data')->assertJsonPath('meta.total', 3);
        $this->getJson('/api/v1/admin/jobs?per_page=999')->assertJsonPath('meta.per_page', 50);
        // Drafts are visible to admins.
        $this->getJson('/api/v1/admin/jobs')->assertJsonCount(3, 'data');
    }

    public function test_post_crud_sets_author_slug_reading_time_and_published_at(): void
    {
        $user = $this->actingAsRole('editor');
        $category = PostCategory::factory()->create();

        $response = $this->postJson('/api/v1/admin/posts', [
            'type' => 'blog', 'title' => 'Hello World Post', 'excerpt' => 'Short excerpt.', 'body_markdown' => str_repeat('word ', 450),
            'post_category_id' => $category->id, 'status' => 'published',
        ])->assertCreated()
            ->assertJsonPath('data.slug', 'hello-world-post')
            ->assertJsonPath('data.author_id', $user->id)
            ->assertJsonPath('data.reading_minutes', 3);
        $this->assertNotNull($response->json('data.published_at'));

        $id = $response->json('data.id');
        $this->getJson('/api/v1/posts/hello-world-post')->assertOk();

        $this->putJson("/api/v1/admin/posts/{$id}", ['status' => 'draft'])->assertOk()->assertJsonPath('data.status', 'draft');
        $this->getJson('/api/v1/posts/hello-world-post')->assertNotFound();

        $this->postJson('/api/v1/admin/posts', ['type' => 'newsletter', 'post_category_id' => 9999])
            ->assertUnprocessable()->assertJsonValidationErrors(['type', 'title', 'excerpt', 'body_markdown', 'post_category_id']);

        $this->deleteJson("/api/v1/admin/posts/{$id}")->assertNoContent();
    }

    public function test_categories_services_testimonials_faqs_and_programs_crud(): void
    {
        $this->actingAsRole('editor');

        $cat = $this->postJson('/api/v1/admin/post-categories', ['name' => 'Case Studies', 'type' => 'article'])->assertCreated()
            ->assertJsonPath('data.slug', 'case-studies');
        $this->patchJson('/api/v1/admin/post-categories/'.$cat->json('data.id'), ['name' => 'Customer Stories'])->assertOk();
        $this->getJson('/api/v1/admin/post-categories')->assertOk()->assertJsonPath('data.0.posts_count', 0);

        $service = $this->postJson('/api/v1/admin/services', [
            'title' => 'Onboarding Support', 'summary' => 'Help.', 'group' => 'hiring_model', 'status' => 'published',
            'features' => ['One', 'Two'], 'process_steps' => [['title' => 'Plan', 'description' => 'We plan.']],
            'advantages' => [['title' => 'Fast', 'description' => 'Quickly.']], 'sort_order' => 3,
        ])->assertCreated()->assertJsonPath('data.slug', 'onboarding-support');
        $this->getJson('/api/v1/services/onboarding-support')->assertOk()->assertJsonPath('data.process_steps.0.title', 'Plan');
        $this->postJson('/api/v1/admin/services', ['title' => 'X', 'summary' => 'Y', 'group' => 'solution', 'process_steps' => [['title' => 'only title']]])
            ->assertJsonValidationErrors(['process_steps.0.description']);
        $this->deleteJson('/api/v1/admin/services/'.$service->json('data.id'))->assertNoContent();

        $t = $this->postJson('/api/v1/admin/testimonials', ['name' => 'Pat', 'quote' => 'Great work.', 'rating' => 5])->assertCreated();
        $this->postJson('/api/v1/admin/testimonials', ['name' => 'Pat', 'quote' => 'x', 'rating' => 9])->assertJsonValidationErrors(['rating']);
        $this->patchJson('/api/v1/admin/testimonials/'.$t->json('data.id'), ['is_published' => false])->assertOk();
        $this->getJson('/api/v1/testimonials')->assertJsonCount(0, 'data');

        $faq = $this->postJson('/api/v1/admin/faqs', ['group' => 'employers', 'question' => 'Why?', 'answer' => 'Because.'])->assertCreated();
        $this->postJson('/api/v1/admin/faqs', ['group' => 'bogus', 'question' => 'Why?', 'answer' => 'Because.'])->assertJsonValidationErrors(['group']);
        $this->deleteJson('/api/v1/admin/faqs/'.$faq->json('data.id'))->assertNoContent();

        $program = $this->postJson('/api/v1/admin/mentorship-programs', [
            'name' => 'Leadership Track', 'tier' => 'premium', 'audience' => 'employers', 'summary' => 'For leaders.',
            'price_amount' => 1200, 'price_unit_label' => 'per role / month', 'features' => ['Coaching'],
        ])->assertCreated()->assertJsonPath('data.slug', 'leadership-track')->assertJsonPath('data.price_display', '$1,200 per role / month');
        $this->deleteJson('/api/v1/admin/mentorship-programs/'.$program->json('data.id'))->assertNoContent();

        $this->assertSame(1, PostCategory::query()->count());
        $this->assertSame(0, Service::query()->count() + Faq::query()->count() + MentorshipProgram::query()->count());
        $this->assertSame(1, Testimonial::query()->count());
    }

    public function test_media_upload_stores_on_public_disk_with_random_name(): void
    {
        Storage::fake('public');
        $this->actingAsRole('editor');

        $response = $this->post('/api/v1/admin/media', ['file' => UploadedFile::fake()->image('Cover Photo.png', 600, 400)], ['Accept' => 'application/json'])
            ->assertCreated()->assertJsonStructure(['data' => ['url', 'path']]);

        $path = $response->json('data.path');
        Storage::disk('public')->assertExists($path);
        $this->assertSame('/storage/'.$path, $response->json('data.url'));
        $this->assertMatchesRegularExpression('#^uploads/\d{4}/\d{2}/[A-Za-z0-9]{40}\.png$#', $path);
    }

    public function test_media_upload_rejects_non_images_svg_and_large_files(): void
    {
        Storage::fake('public');
        $this->actingAsRole('editor');

        foreach ([
            UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf'),
            UploadedFile::fake()->create('logo.svg', 10, 'image/svg+xml'),
            UploadedFile::fake()->create('shell.php', 1, 'application/x-php'),
            UploadedFile::fake()->image('huge.jpg')->size(5000),
        ] as $file) {
            $this->post('/api/v1/admin/media', ['file' => $file], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors(['file']);
        }
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_settings_can_be_read_and_updated_by_group(): void
    {
        $this->actingAsRole('super-admin');

        $this->putJson('/api/v1/admin/settings', [
            'company' => ['name' => 'DIGIT-B', 'tagline' => 'New tagline', 'description' => 'Desc'],
            'contact' => ['email' => 'hello@digit-b.com', 'phone' => '+1 000', 'address_lines' => ['Columbus'], 'hours' => [['days' => 'Mon', 'time' => '9-5']]],
            'social' => ['linkedin' => 'https://linkedin.com/company/digit-b'],
            'stats' => [['value' => '12+', 'label' => 'Years']],
        ])->assertOk()->assertJsonPath('data.company.tagline', 'New tagline')->assertJsonPath('data.stats.0.value', '12+');

        $this->getJson('/api/v1/settings')->assertOk()
            ->assertJsonPath('data.contact.email', 'hello@digit-b.com')
            ->assertJsonPath('data.social.linkedin', 'https://linkedin.com/company/digit-b');
        $this->assertSame('New tagline', app(SiteSettings::class)->get('company', 'tagline'));
        $this->assertDatabaseCount('site_settings', 9);

        $this->putJson('/api/v1/admin/settings', ['contact' => ['email' => 'not-an-email'], 'social' => ['x' => 'javascript:alert(1)'], 'stats' => [['value' => '1']]])
            ->assertUnprocessable()->assertJsonValidationErrors(['contact.email', 'social.x', 'stats.0.label']);
    }
}
