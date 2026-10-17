<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * All permissions used in the application (Spatie user login + management).
     */
    protected array $permissions = [
        // Users
        'view_users',
        'view_user',
        'create_user',
        'update_user',
        'delete_user',
        // Roles
        'view_roles',
        'create_roles',
        'update_roles',
        'delete_roles',
        // Permissions
        'view_permissions',
        'create_permissions',
        'update_permissions',
        'delete_permissions',
    ];

    protected function adminEmail(): string
    {
        return config('app.admin_email', env('ADMIN_EMAIL', 'admin@gmail.com'));
    }

    public function run(): void
    {
        $guardName = config('auth.defaults.guard', 'web');
        $adminEmail = $this->adminEmail();

        foreach ($this->permissions as $name) {
            Permission::firstOrCreate(
                ['name' => $name, 'guard_name' => $guardName],
                ['name' => $name, 'guard_name' => $guardName]
            );
        }

        $adminUser = \App\Models\User::where('email', $adminEmail)->first();

        if ($adminUser) {
            $adminUser->givePermissionTo(Permission::all());
            $this->command->info("All permissions assigned to admin user: {$adminEmail}");
        } else {
            $this->command->warn("Admin user with email '{$adminEmail}' not found. Run DatabaseSeeder first or create the user.");
        }

        $adminRole = Role::where('name', 'super_admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo(Permission::all());
            $this->command->info('All permissions assigned to admin role.');
        }
    }
}
