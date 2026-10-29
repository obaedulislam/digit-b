<?php

namespace Tests\Feature\Admin;

use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AuthorizationMatrixTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, array{string, string}> endpoint => [method, uri] */
    public static function endpoints(): array
    {
        return [
            'dashboard' => ['GET', '/api/v1/admin/dashboard'],
            'jobs' => ['GET', '/api/v1/admin/jobs'],
            'applications' => ['GET', '/api/v1/admin/applications'],
            'applications export' => ['GET', '/api/v1/admin/applications/export'],
            'inquiries' => ['GET', '/api/v1/admin/inquiries'],
            'mentorship requests' => ['GET', '/api/v1/admin/mentorship-requests'],
            'subscribers' => ['GET', '/api/v1/admin/subscribers'],
            'mentorship programs' => ['GET', '/api/v1/admin/mentorship-programs'],
            'posts' => ['GET', '/api/v1/admin/posts'],
            'post categories' => ['GET', '/api/v1/admin/post-categories'],
            'services' => ['GET', '/api/v1/admin/services'],
            'testimonials' => ['GET', '/api/v1/admin/testimonials'],
            'faqs' => ['GET', '/api/v1/admin/faqs'],
            'settings' => ['GET', '/api/v1/admin/settings'],
            'users' => ['GET', '/api/v1/admin/users'],
            'roles' => ['GET', '/api/v1/admin/roles'],
        ];
    }

    /** @return array<string, list<string>> role => endpoints it MAY access */
    private static function allowed(): array
    {
        return [
            'super-admin' => array_keys(self::endpoints()),
            'editor' => ['dashboard', 'mentorship programs', 'posts', 'post categories', 'services', 'testimonials', 'faqs'],
            'recruiter' => ['dashboard', 'jobs', 'applications', 'applications export', 'inquiries', 'mentorship requests', 'subscribers'],
        ];
    }

    #[DataProvider('endpoints')]
    public function test_guests_get_401_json(string $method, string $uri): void
    {
        $this->json($method, $uri)->assertUnauthorized()->assertExactJson(['message' => 'Unauthenticated.']);
    }

    #[DataProvider('endpoints')]
    public function test_role_matrix(string $method, string $uri): void
    {
        $name = array_search([$method, $uri], self::endpoints(), true);

        foreach (self::allowed() as $role => $permitted) {
            $this->actingAsRole($role);
            $response = $this->json($method, $uri);

            if (in_array($name, $permitted, true)) {
                $this->assertContains($response->getStatusCode(), [200], "{$role} should access {$name}, got {$response->getStatusCode()}");
            } else {
                $this->assertSame(403, $response->getStatusCode(), "{$role} must NOT access {$name}, got {$response->getStatusCode()}");
                $response->assertJsonStructure(['message']);
            }

            $this->app['auth']->forgetGuards();
        }
    }

    public function test_recruiter_cannot_manage_users_or_settings_and_editor_cannot_see_applications(): void
    {
        $this->actingAsRole('recruiter');
        $this->getJson('/api/v1/admin/users')->assertForbidden();
        $this->putJson('/api/v1/admin/settings', ['company' => ['name' => 'X']])->assertForbidden();
        $this->postJson('/api/v1/admin/users', [])->assertForbidden();

        $this->app['auth']->forgetGuards();
        $this->actingAsRole('editor');
        $this->getJson('/api/v1/admin/applications')->assertForbidden();
        $this->getJson('/api/v1/admin/applications/1/resume')->assertForbidden();
    }

    public function test_dashboard_hides_data_the_role_cannot_access(): void
    {
        $this->actingAsRole('editor');

        $this->getJson('/api/v1/admin/dashboard')->assertOk()
            ->assertJsonPath('data.counts.new_applications', null)
            ->assertJsonPath('data.recent_applications', [])
            ->assertJsonPath('data.recent_inquiries', []);
    }
}
