<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function admin(string $password = 'Correct-Horse-9'): User
    {
        return $this->userWithRole('super-admin', ['email' => 'admin@digit-b.test', 'password' => $password]);
    }

    public function test_csrf_cookie_endpoint_is_available(): void
    {
        $this->withHeaders($this->spaHeaders())->get('/sanctum/csrf-cookie')->assertNoContent()->assertCookie('XSRF-TOKEN');
    }

    public function test_login_returns_admin_user_and_authenticates_the_session(): void
    {
        $this->admin();

        $response = $this->withHeaders($this->spaHeaders())
            ->postJson('/api/v1/auth/login', ['email' => 'admin@digit-b.test', 'password' => 'Correct-Horse-9']);

        $response->assertOk()
            ->assertJsonPath('data.email', 'admin@digit-b.test')
            ->assertJsonPath('data.roles', ['super-admin'])
            ->assertJsonStructure(['data' => ['id', 'name', 'email', 'roles', 'permissions']]);
        $this->assertContains('manage-users', $response->json('data.permissions'));
        $this->assertAuthenticated('web');
        $response->assertJsonMissingPath('data.password');
    }

    public function test_login_regenerates_the_session_id(): void
    {
        $this->admin();
        $headers = $this->spaHeaders();

        $csrf = $this->withHeaders($headers)->get('/sanctum/csrf-cookie');
        $before = $csrf->getCookie(config('session.cookie'))->getValue();

        $login = $this->withHeaders($headers)->withCookie(config('session.cookie'), $before)
            ->postJson('/api/v1/auth/login', ['email' => 'admin@digit-b.test', 'password' => 'Correct-Horse-9'])->assertOk();

        $after = $login->getCookie(config('session.cookie'))->getValue();
        $this->assertNotSame($before, $after);
    }

    public function test_login_rejects_bad_credentials_without_revealing_which_part(): void
    {
        $this->admin();

        $this->withHeaders($this->spaHeaders())->postJson('/api/v1/auth/login', ['email' => 'admin@digit-b.test', 'password' => 'wrong'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->withHeaders($this->spaHeaders())->postJson('/api/v1/auth/login', ['email' => 'ghost@digit-b.test', 'password' => 'wrong'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->assertGuest('web');
    }

    public function test_login_validation(): void
    {
        $this->withHeaders($this->spaHeaders())->postJson('/api/v1/auth/login', [])->assertUnprocessable()->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_is_throttled_after_five_attempts(): void
    {
        $this->admin();

        for ($i = 0; $i < 5; $i++) {
            $this->withHeaders($this->spaHeaders())->postJson('/api/v1/auth/login', ['email' => 'admin@digit-b.test', 'password' => 'wrong'])->assertUnprocessable();
        }

        $this->withHeaders($this->spaHeaders())->postJson('/api/v1/auth/login', ['email' => 'admin@digit-b.test', 'password' => 'Correct-Horse-9'])
            ->assertStatus(429)->assertJsonStructure(['message']);

        // A different e-mail from the same IP has its own bucket.
        $this->withHeaders($this->spaHeaders())->postJson('/api/v1/auth/login', ['email' => 'other@digit-b.test', 'password' => 'x'])->assertUnprocessable();
    }

    public function test_me_returns_user_or_401(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized()->assertExactJson(['message' => 'Unauthenticated.']);

        $user = $this->admin();
        $this->actingAs($user)->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('data.id', $user->id);
    }

    public function test_logout_ends_the_session(): void
    {
        $user = $this->admin();

        $this->actingAs($user)->withHeaders($this->spaHeaders())->postJson('/api/v1/auth/logout')->assertNoContent();

        $this->assertGuest('web');
    }

    public function test_passwords_are_hashed_and_hidden(): void
    {
        $user = $this->admin('Plain-Secret-1');

        $this->assertNotSame('Plain-Secret-1', $user->password);
        $this->assertArrayNotHasKey('password', $user->toArray());
        $this->assertArrayNotHasKey('remember_token', $user->toArray());
    }
}
