<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database (Spatie user login only).
     */
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'web'],
            ['name' => 'admin', 'guard_name' => 'web']
        );

        Role::firstOrCreate(
            ['name' => 'user', 'guard_name' => 'web'],
            ['name' => 'user', 'guard_name' => 'web']
        );

        $adminUser = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin User',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('password'),
            ]
        );
        $adminUser->assignRole($adminRole);

        $this->call([
            PermissionSeeder::class,
            RoleAndPermissionSeeder::class,
            SettingsSeeder::class,
            AdminUserSeeder::class,
            CarMakeModelSeeder::class,
            PackageSeeder::class,
            DemoDataSeeder::class,
        ]);
    }
}
