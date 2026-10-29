<?php

namespace Tests\Feature;

use App\Models\Faq;
use App\Models\JobPosting;
use App\Models\MentorshipProgram;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Service;
use App\Models\Testimonial;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_job_listing_only_shows_open_published_jobs(): void
    {
        JobPosting::factory()->create(['title' => 'Visible Job']);
        JobPosting::factory()->draft()->create(['title' => 'Draft Job']);
        JobPosting::factory()->closed()->create(['title' => 'Closed Job']);
        JobPosting::factory()->expired()->create(['title' => 'Expired Job']);

        $response = $this->getJson('/api/v1/jobs')->assertOk();

        $response->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Visible Job');
        $response->assertJsonStructure([
            'data' => [['id', 'slug', 'title', 'reference_code', 'summary', 'department', 'employment_type', 'employment_type_label',
                'work_mode', 'work_mode_label', 'location', 'country', 'salary' => ['min', 'max', 'currency', 'period', 'display'],
                'experience' => ['min', 'max', 'display'], 'is_featured', 'published_at', 'closes_at']],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            'links',
        ]);
    }

    public function test_job_display_strings_and_hidden_salary(): void
    {
        JobPosting::factory()->create([
            'slug' => 'with-salary', 'salary_min' => 85000, 'salary_max' => 90000, 'experience_min' => 3, 'experience_max' => 5,
            'employment_type' => 'contract_to_hire',
        ]);
        JobPosting::factory()->create([
            'slug' => 'no-salary', 'show_salary' => false, 'experience_min' => null, 'experience_max' => null,
        ]);

        $this->getJson('/api/v1/jobs/with-salary')->assertOk()
            ->assertJsonPath('data.salary.display', '$85,000 – $90,000 / year')
            ->assertJsonPath('data.experience.display', '3–5 years')
            ->assertJsonPath('data.employment_type_label', 'Contract to Hire')
            ->assertJsonStructure(['data' => ['description_markdown', 'responsibilities', 'requirements', 'nice_to_have', 'benefits', 'seo', 'related']]);

        $this->getJson('/api/v1/jobs/no-salary')->assertOk()
            ->assertJsonPath('data.salary', null)
            ->assertJsonPath('data.experience', null);
    }

    public function test_job_search_filter_sort_and_pagination(): void
    {
        JobPosting::factory()->create(['title' => 'Backend Engineer', 'employment_type' => 'full_time', 'work_mode' => 'remote', 'location' => 'Dublin', 'department' => 'Engineering', 'salary_max' => 120000]);
        JobPosting::factory()->create(['title' => 'QA Analyst', 'employment_type' => 'contract', 'work_mode' => 'onsite', 'location' => 'Dhaka', 'department' => 'Quality', 'salary_max' => 60000]);
        JobPosting::factory()->create(['title' => 'Project Manager', 'employment_type' => 'direct_hire', 'work_mode' => 'hybrid', 'location' => 'Dhaka', 'department' => 'Delivery', 'salary_max' => null, 'show_salary' => false]);

        $this->getJson('/api/v1/jobs?search=engineer')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/jobs?employment_type=contract')->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'QA Analyst');
        $this->getJson('/api/v1/jobs?work_mode=remote')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/jobs?location=Dhaka')->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/jobs?department=Engineering')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/jobs?employment_type=bogus')->assertJsonCount(3, 'data');
        $this->getJson('/api/v1/jobs?sort=title')->assertJsonPath('data.0.title', 'Backend Engineer');
        $this->getJson('/api/v1/jobs?sort=salary_desc')->assertJsonPath('data.0.title', 'Backend Engineer')->assertJsonPath('data.2.title', 'Project Manager');

        $page = $this->getJson('/api/v1/jobs?per_page=2&page=2')->assertOk();
        $page->assertJsonCount(1, 'data')->assertJsonPath('meta.current_page', 2)->assertJsonPath('meta.last_page', 2)->assertJsonPath('meta.total', 3);
    }

    public function test_search_treats_wildcards_literally_and_per_page_is_clamped(): void
    {
        JobPosting::factory()->count(3)->create();

        $this->getJson('/api/v1/jobs?search=%25')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/jobs?per_page=500')->assertOk()->assertJsonPath('meta.per_page', 50);
        $this->getJson('/api/v1/jobs?per_page=0')->assertOk()->assertJsonPath('meta.per_page', 1);
    }

    public function test_job_filters_endpoint_returns_counts(): void
    {
        JobPosting::factory()->count(2)->create(['employment_type' => 'full_time', 'location' => 'Dublin']);
        JobPosting::factory()->create(['employment_type' => 'contract', 'location' => 'Dhaka']);
        JobPosting::factory()->draft()->create(['employment_type' => 'temporary']);

        $response = $this->getJson('/api/v1/jobs/filters')->assertOk();

        $response->assertJsonStructure(['data' => ['employment_types', 'work_modes', 'locations', 'departments']]);
        $types = collect($response->json('data.employment_types'))->keyBy('value');
        $this->assertSame(2, $types['full_time']['count']);
        $this->assertSame('Full Time', $types['full_time']['label']);
        $this->assertArrayNotHasKey('temporary', $types->all());
    }

    public function test_job_detail_returns_related_and_404s_for_unavailable_jobs(): void
    {
        JobPosting::factory()->count(4)->create();
        $job = JobPosting::factory()->create(['slug' => 'the-job']);
        JobPosting::factory()->draft()->create(['slug' => 'secret']);

        $this->getJson('/api/v1/jobs/the-job')->assertOk()->assertJsonCount(3, 'data.related');
        $this->getJson('/api/v1/jobs/secret')->assertNotFound()->assertExactJson(['message' => 'Resource not found.']);
        $this->getJson('/api/v1/jobs/nope')->assertNotFound();
    }

    public function test_services_list_filter_and_detail(): void
    {
        Service::factory()->create(['slug' => 'talent-acquisition', 'group' => 'solution', 'sort_order' => 1]);
        Service::factory()->create(['slug' => 'direct-hire', 'group' => 'hiring_model', 'sort_order' => 2]);
        Service::factory()->create(['slug' => 'hidden', 'status' => 'draft']);

        $this->getJson('/api/v1/services')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/services?group=hiring_model')->assertJsonCount(1, 'data')->assertJsonPath('data.0.slug', 'direct-hire');
        $this->getJson('/api/v1/services/direct-hire')->assertOk()
            ->assertJsonStructure(['data' => ['id', 'slug', 'title', 'summary', 'icon', 'group', 'features', 'image', 'body_markdown', 'process_steps', 'advantages', 'seo']]);
        $this->getJson('/api/v1/services/hidden')->assertNotFound();
    }

    public function test_posts_list_filter_detail_and_categories(): void
    {
        $news = PostCategory::factory()->create(['slug' => 'latest-news', 'name' => 'Latest News', 'type' => 'article']);
        $blogCat = PostCategory::factory()->create(['slug' => 'our-blog', 'name' => 'Our Blog', 'type' => 'blog']);
        Post::factory()->count(2)->create(['post_category_id' => $news->id, 'type' => 'article']);
        Post::factory()->blog()->create(['post_category_id' => $blogCat->id, 'slug' => 'a-blog-post', 'title' => 'Hiring mistakes']);
        Post::factory()->draft()->create();

        $this->getJson('/api/v1/posts')->assertOk()->assertJsonCount(3, 'data');
        $this->getJson('/api/v1/posts?type=article')->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/posts?type=blog&category=our-blog')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/posts?search=mistakes')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/posts?per_page=2')->assertJsonCount(2, 'data')->assertJsonPath('meta.last_page', 2);

        $this->getJson('/api/v1/posts/a-blog-post')->assertOk()
            ->assertJsonPath('data.type', 'blog')
            ->assertJsonPath('data.category.slug', 'our-blog')
            ->assertJsonPath('data.author.name', 'DIGIT-B Editorial Team')
            ->assertJsonStructure(['data' => ['body_markdown', 'reading_minutes', 'seo' => ['title', 'description', 'og_image'], 'related']]);

        $cats = $this->getJson('/api/v1/post-categories')->assertOk()->json('data');
        $this->assertSame(2, collect($cats)->firstWhere('slug', 'latest-news')['posts_count']);
        // Categories without a type (factory default) belong to both sections.
        $this->getJson('/api/v1/post-categories?type=blog')->assertJsonCount(2, 'data');
    }

    public function test_reading_minutes_is_computed_from_body(): void
    {
        $post = Post::factory()->create(['body_markdown' => str_repeat('word ', 650)]);

        $this->assertSame(4, $post->fresh()->reading_minutes);
    }

    public function test_settings_returns_contract_shape_with_defaults(): void
    {
        $this->getJson('/api/v1/settings')->assertOk()
            ->assertJsonPath('data.company.name', 'DIGIT-B')
            ->assertJsonPath('data.contact.email', 'contact@digit-b.com')
            ->assertJsonStructure(['data' => ['company' => ['name', 'tagline', 'description'], 'contact' => ['email', 'phone', 'address_lines', 'hours', 'map_url'],
                'social' => ['linkedin', 'facebook', 'x', 'instagram'], 'stats', 'seo' => ['site_title', 'default_description', 'og_image']]]);
    }

    public function test_home_aggregates_sections(): void
    {
        Service::factory()->count(7)->create(['group' => 'solution']);
        JobPosting::factory()->count(5)->create();
        JobPosting::factory()->create(['is_featured' => true, 'title' => 'Featured One']);
        Post::factory()->count(4)->create();
        Testimonial::factory()->count(2)->create();
        MentorshipProgram::factory()->count(2)->create();
        Faq::factory()->count(2)->create(['group' => 'about']);
        Faq::factory()->create(['group' => 'candidates']);

        $response = $this->getJson('/api/v1/home')->assertOk();

        $response->assertJsonCount(6, 'data.services')
            ->assertJsonCount(3, 'data.featured_jobs')
            ->assertJsonPath('data.featured_jobs.0.title', 'Featured One')
            ->assertJsonCount(3, 'data.latest_posts')
            ->assertJsonCount(2, 'data.testimonials')
            ->assertJsonCount(2, 'data.mentorship_programs')
            ->assertJsonCount(2, 'data.faqs');
    }

    public function test_mentorship_programs_testimonials_and_faqs(): void
    {
        MentorshipProgram::factory()->create(['slug' => 'career-switch', 'price_amount' => 9.82, 'price_unit_label' => 'per person / month']);
        MentorshipProgram::factory()->create(['is_published' => false]);
        Testimonial::factory()->create(['is_published' => false]);
        Testimonial::factory()->create();
        Faq::factory()->create(['group' => 'employers']);
        Faq::factory()->create(['group' => 'candidates']);

        $this->getJson('/api/v1/mentorship/programs')->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.price.display', '$9.82 per person / month')
            ->assertJsonPath('data.0.price.amount', 9.82);
        $this->getJson('/api/v1/testimonials')->assertJsonCount(1, 'data')->assertJsonStructure(['data' => [['id', 'name', 'role', 'company', 'quote', 'rating', 'avatar']]]);
        $this->getJson('/api/v1/faqs')->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/faqs?group=employers')->assertJsonCount(1, 'data')->assertJsonPath('data.0.group', 'employers');
    }

    public function test_sitemap_and_robots_use_frontend_url(): void
    {
        JobPosting::factory()->create(['slug' => 'open-role']);
        JobPosting::factory()->draft()->create(['slug' => 'draft-role']);
        Post::factory()->blog()->create(['slug' => 'blog-post']);
        Post::factory()->create(['slug' => 'news-post']);
        Service::factory()->create(['slug' => 'direct-hire']);

        $sitemap = $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml; charset=UTF-8')->getContent();
        $this->assertStringContainsString('<loc>https://digit-b.test/vacancies/open-role</loc>', $sitemap);
        $this->assertStringContainsString('<loc>https://digit-b.test/blog/blog-post</loc>', $sitemap);
        $this->assertStringContainsString('<loc>https://digit-b.test/articles/news-post</loc>', $sitemap);
        $this->assertStringContainsString('<loc>https://digit-b.test/services/direct-hire</loc>', $sitemap);
        $this->assertStringNotContainsString('draft-role', $sitemap);
        $this->assertNotFalse(simplexml_load_string($sitemap));

        $this->get('/robots.txt')->assertOk()->assertSee('Sitemap: https://digit-b.test/sitemap.xml', false);
    }

    public function test_errors_are_json_without_leaking_internals_and_security_headers_present(): void
    {
        $response = $this->get('/api/v1/does-not-exist', ['Accept' => 'text/html']);

        $response->assertNotFound()->assertJsonStructure(['message']);
        $this->assertStringNotContainsString('Symfony', $response->getContent());
        $response->assertHeader('X-Content-Type-Options', 'nosniff')->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }
}
