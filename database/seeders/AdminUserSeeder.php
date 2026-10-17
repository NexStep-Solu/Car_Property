<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $reviewerRole = Role::firstOrCreate(
            ['name' => 'reviewer', 'guard_name' => 'admin'],
            ['name' => 'reviewer', 'guard_name' => 'admin']
        );
        $supportRole = Role::firstOrCreate(
            ['name' => 'support', 'guard_name' => 'admin'],
            ['name' => 'support', 'guard_name' => 'admin']
        );

        $staff = [
            ['name' => 'Reviewer One', 'email' => 'reviewer1@carmarket.local', 'role' => $reviewerRole],
            ['name' => 'Reviewer Two', 'email' => 'reviewer2@carmarket.local', 'role' => $reviewerRole],
            ['name' => 'Support One', 'email' => 'support1@carmarket.local', 'role' => $supportRole],
            ['name' => 'Support Two', 'email' => 'support2@carmarket.local', 'role' => $supportRole],
        ];

        foreach ($staff as $member) {
            $user = User::firstOrCreate(
                ['email' => $member['email']],
                [
                    'name' => $member['name'],
                    'email' => $member['email'],
                    'password' => Hash::make('password'),
                    'is_admin_account' => true,
                    'account_status' => 'active',
                    'email_verified_at' => now(),
                ]
            );

            // Direct attach: User::$guard_name is pinned to 'web', so
            // assignRole() would throw GuardDoesNotMatch for admin roles.
            if (! $user->roles()->where('roles.id', $member['role']->id)->exists()) {
                $user->roles()->attach($member['role']->id);
            }
        }

        $this->command->info('Admin users seeded (2 reviewers, 2 support).');
    }
}
