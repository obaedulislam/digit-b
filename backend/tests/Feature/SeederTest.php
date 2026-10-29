<?php

namespace Tests\Feature;

use App\Models\Faq;
use App\Models\JobPosting;
use App\Models\MentorshipProgram;
use App\Models\Post;
use App\Models\Service;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_creates_the_launch_content(): void
    {
        $this->seed();

        $this->assertSame(6, Service::query()->where('group', 'solution')->count());
        $this->assertSame(5, Service::query()->where('group', 'hiring_model')->count());
        foreach (['temporary-staffing', 'direct-hire', 'contract', 'payrolling', 'training'] as $slug) {
            $this->assertTrue(Service::query()->where('slug', $slug)->exists(), $slug);
        }

        $this->assertSame(7, JobPosting::query()->count());
        $this->assertSame('draft', JobPosting::query()->where('slug', 'people-manager-4')->firstOrFail()->status->value);
        $this->assertSame(6, JobPosting::query()->open()->count());

        $this->assertSame(4, Post::query()->count());
        Post::query()->get()->each(function (Post $post) {
            $words = str_word_count($post->body_markdown);
            $this->assertGreaterThanOrEqual(480, $words, "{$post->slug} body is too short ({$words} words)");
            $this->assertLessThanOrEqual(800, $words, $post->slug);
        });
        $this->assertSame('Latest News', Post::query()->where('type', 'article')->first()->category->name);

        $this->assertSame(5, Testimonial::query()->count());
        $this->assertSame(4, MentorshipProgram::query()->count());
        $this->assertSame(['standard', 'standard', 'premium', 'premium'], MentorshipProgram::query()->orderBy('sort_order')->pluck('tier')->map->value->all());
        $this->assertGreaterThanOrEqual(13, Faq::query()->count());

        $this->getJson('/api/v1/settings')->assertOk()
            ->assertJsonPath('data.contact.email', 'contact@digit-b.com')
            ->assertJsonPath('data.contact.phone', '+1 (352) 256-9875');
    }

    public function test_super_admin_is_created_from_env_and_demo_users_are_local_only(): void
    {
        $this->seed();

        $admin = User::query()->where('email', 'admin@digit-b.test')->firstOrFail();
        $this->assertTrue($admin->isSuperAdmin());
        $this->assertTrue(Hash::check('Secret-Pass-123', $admin->password));
        $this->assertSame(1, User::query()->count(), 'no demo users outside the local environment');
    }

    public function test_demo_users_and_samples_exist_in_local_environment(): void
    {
        $this->app['env'] = 'local';
        $this->seed();

        $this->assertTrue(User::query()->where('email', 'editor@digit-b.test')->firstOrFail()->hasRole('editor'));
        $this->assertTrue(User::query()->where('email', 'recruiter@digit-b.test')->firstOrFail()->hasRole('recruiter'));
        $this->assertDatabaseCount('applications', 6);
    }

    public function test_missing_admin_password_generates_a_random_one(): void
    {
        config(['digitb.admin.password' => null]);

        $this->artisan('db:seed')->expectsOutputToContain('random super-admin password was generated')->assertSuccessful();

        $admin = User::query()->where('email', 'admin@digit-b.test')->firstOrFail();
        $this->assertTrue($admin->isSuperAdmin());
        $this->assertFalse(Hash::check('Secret-Pass-123', $admin->password));
    }

    public function test_seeding_twice_is_idempotent(): void
    {
        $this->seed();
        $this->seed();

        $this->assertSame(7, JobPosting::query()->count());
        $this->assertSame(11, Service::query()->count());
        $this->assertSame(1, User::query()->count());
    }
}
