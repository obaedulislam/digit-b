<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_create_update_and_delete_users(): void
    {
        $this->actingAsRole('super-admin');

        $response = $this->postJson('/api/v1/admin/users', [
            'name' => 'New Recruiter', 'email' => 'New.Recruiter@Example.com', 'password' => 'Str0ngPassword!', 'roles' => ['recruiter'],
        ])->assertCreated()->assertJsonPath('data.email', 'new.recruiter@example.com')->assertJsonPath('data.roles', ['recruiter']);
        $response->assertJsonMissingPath('data.password');
        $id = $response->json('data.id');

        $this->assertNotSame('Str0ngPassword!', User::find($id)->password, 'password is hashed');

        $this->patchJson("/api/v1/admin/users/{$id}", ['name' => 'Renamed', 'roles' => ['editor']])->assertOk()
            ->assertJsonPath('data.name', 'Renamed')->assertJsonPath('data.roles', ['editor']);
        $this->assertTrue(User::find($id)->hasRole('editor'));

        $this->getJson('/api/v1/admin/users?role=editor')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/admin/roles')->assertOk()->assertJsonCount(3, 'data');

        $this->deleteJson("/api/v1/admin/users/{$id}")->assertNoContent();
        $this->assertDatabaseMissing('users', ['id' => $id]);
    }

    public function test_user_validation(): void
    {
        $this->actingAsRole('super-admin');
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/v1/admin/users', [])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'password', 'roles']);
        $this->postJson('/api/v1/admin/users', ['name' => 'A', 'email' => 'taken@example.com', 'password' => 'weak', 'roles' => ['hacker']])
            ->assertUnprocessable()->assertJsonValidationErrors(['email', 'password', 'roles.0']);
    }

    public function test_cannot_delete_yourself(): void
    {
        $me = $this->actingAsRole('super-admin');
        $this->userWithRole('super-admin');

        $this->deleteJson("/api/v1/admin/users/{$me->id}")->assertForbidden()
            ->assertJsonPath('message', 'You cannot delete your own account.');
        $this->assertDatabaseHas('users', ['id' => $me->id]);
    }

    public function test_cannot_demote_yourself(): void
    {
        $me = $this->actingAsRole('super-admin');
        $this->userWithRole('super-admin');

        $this->patchJson("/api/v1/admin/users/{$me->id}", ['roles' => ['editor']])->assertForbidden()
            ->assertJsonPath('message', 'You cannot remove your own super-admin role.');
        $this->assertTrue($me->fresh()->hasRole('super-admin'));
    }

    public function test_last_super_admin_cannot_be_deleted_or_demoted(): void
    {
        // Actor is a user with manage-users but who is not a super-admin, e.g. a custom role.
        $this->seedRoles();
        Role::findOrCreate('user-manager', 'web')->givePermissionTo('manage-users');
        $actor = User::factory()->create();
        $actor->assignRole('user-manager');
        $this->actingAs($actor);

        $onlySuperAdmin = $this->userWithRole('super-admin');
        $this->assertSame(1, User::superAdminCount());

        $this->deleteJson("/api/v1/admin/users/{$onlySuperAdmin->id}")->assertForbidden()
            ->assertJsonPath('message', 'The last super-admin cannot be deleted.');
        $this->patchJson("/api/v1/admin/users/{$onlySuperAdmin->id}", ['roles' => ['editor']])->assertForbidden()
            ->assertJsonPath('message', 'The last super-admin cannot be demoted.');

        $this->assertTrue($onlySuperAdmin->fresh()->hasRole('super-admin'));

        // With a second super-admin, the first can be demoted and deleted.
        $second = $this->userWithRole('super-admin');
        $this->patchJson("/api/v1/admin/users/{$onlySuperAdmin->id}", ['roles' => ['editor']])->assertOk();
        $this->deleteJson("/api/v1/admin/users/{$second->id}")->assertForbidden(); // now the last one again
    }

    public function test_super_admin_can_delete_another_super_admin_when_two_exist(): void
    {
        $this->actingAsRole('super-admin');
        $other = $this->userWithRole('super-admin');

        $this->deleteJson("/api/v1/admin/users/{$other->id}")->assertNoContent();
    }

    public function test_password_can_be_changed_and_blank_password_keeps_the_old_one(): void
    {
        $this->actingAsRole('super-admin');
        $user = User::factory()->create(['password' => 'Old-Password-1']);
        $oldHash = $user->password;

        $this->patchJson("/api/v1/admin/users/{$user->id}", ['name' => 'Same Pass'])->assertOk();
        $this->assertSame($oldHash, $user->fresh()->password);

        $this->patchJson("/api/v1/admin/users/{$user->id}", ['password' => 'Brand-New-Pass-2'])->assertOk();
        $this->assertNotSame($oldHash, $user->fresh()->password);
    }
}
