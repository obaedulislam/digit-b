<?php

namespace Tests;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

abstract class TestCase extends BaseTestCase
{
    /** Headers that make Sanctum treat a request as coming from the SPA (stateful, cookie session). */
    protected function spaHeaders(): array
    {
        return ['Origin' => 'http://localhost:5173', 'Referer' => 'http://localhost:5173/admin'];
    }

    protected function seedRoles(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /** Creates a user holding the given role (seeding roles on first use). */
    protected function userWithRole(string $role, array $attributes = []): User
    {
        if (! Role::query()->where('name', $role)->exists()) {
            $this->seedRoles();
        }

        $user = User::factory()->create($attributes);
        $user->assignRole($role);

        return $user;
    }

    protected function actingAsRole(string $role): User
    {
        $user = $this->userWithRole($role);
        $this->actingAs($user);

        return $user;
    }
}
