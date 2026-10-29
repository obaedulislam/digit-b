<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Creates the super-admin from ADMIN_EMAIL / ADMIN_PASSWORD.
 * If ADMIN_PASSWORD is empty a random password is generated and printed ONCE.
 * An existing account is never overwritten (safe to re-run).
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = mb_strtolower((string) (config('digitb.admin.email') ?: 'admin@digit-b.com'));

        $user = User::query()->where('email', $email)->first();

        if ($user === null) {
            $generated = blank(config('digitb.admin.password'));
            $password = $generated ? Str::password(20, symbols: false) : (string) config('digitb.admin.password');

            $user = User::query()->create([
                'name' => config('digitb.admin.name') ?: 'Site Administrator',
                'email' => $email,
                'password' => $password,
            ]);
            $user->email_verified_at = now();
            $user->save();

            if ($generated) {
                $this->command?->warn('ADMIN_PASSWORD is not set. A random super-admin password was generated.');
                $this->command?->warn("  email:    {$email}");
                $this->command?->warn("  password: {$password}");
                $this->command?->warn('  Store it now: it will not be shown again.');
            } else {
                $this->command?->info("Super-admin created: {$email} (password from ADMIN_PASSWORD).");
            }
        } else {
            $this->command?->info("Super-admin {$email} already exists; left unchanged.");
        }

        if (! $user->hasRole(User::SUPER_ADMIN_ROLE)) {
            $user->assignRole(User::SUPER_ADMIN_ROLE);
        }
    }
}
