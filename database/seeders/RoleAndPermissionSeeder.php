<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Web guard permissions for the Car Selling App.
     *
     * @var list<string>
     */
    protected array $webPermissions = [
        'browse cars',
        'send inquiry',
        'save favorite',
        'report listing',
        'apply as seller',
        'manage own listings',
        'manage showroom',
        'manage showroom staff',
        'manage showroom profile',
        'purchase package',
        'view own subscription',
    ];

    /**
     * Admin guard permissions for the Car Selling App.
     *
     * @var list<string>
     */
    protected array $adminPermissions = [
        'access admin panel',
        'review seller documents',
        'approve sellers',
        'reject sellers',
        'review showroom documents',
        'approve showrooms',
        'reject showrooms',
        'review car listings',
        'approve cars',
        'reject cars',
        'manage packages',
        'confirm payments',
        'refund payments',
        'manage users',
        'suspend users',
        'handle reports',
        'view audit logs',
        'manage settings',
        'manage admin users',
        'packages.manage',
        'payments.manage',
        'dashboard.view',
        'users.view',
        'users.manage',
        'audit_logs.view',
    ];

    /**
     * Web guard roles mapped to their permissions.
     *
     * @var array<string, list<string>>
     */
    protected array $webRoles = [
        'buyer' => [
            'browse cars',
            'send inquiry',
            'save favorite',
            'report listing',
        ],
        'individual_seller' => [
            'browse cars',
            'send inquiry',
            'save favorite',
            'manage own listings',
            'report listing',
        ],
        'showroom_owner' => [
            'manage own listings',
            'manage showroom',
            'manage showroom staff',
            'manage showroom profile',
            'purchase package',
            'view own subscription',
        ],
        'showroom_manager' => [
            'manage own listings',
            'manage showroom staff',
            'view own subscription',
        ],
        'showroom_staff' => [
            'manage own listings',
        ],
    ];

    /**
     * Admin guard roles mapped to their permissions.
     *
     * @var array<string, list<string>>
     */
    protected array $adminRoles = [
        'reviewer' => [
            'access admin panel',
            'review seller documents',
            'approve sellers',
            'reject sellers',
            'review showroom documents',
            'approve showrooms',
            'reject showrooms',
            'review car listings',
            'approve cars',
            'reject cars',
            'handle reports',
            'dashboard.view',
        ],
        'support' => [
            'access admin panel',
            'handle reports',
            'manage users',
            'suspend users',
            'view audit logs',
            'dashboard.view',
            'users.view',
            'users.manage',
            'audit_logs.view',
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach ($this->webPermissions as $name) {
            Permission::firstOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
                ['name' => $name, 'guard_name' => 'web']
            );
        }

        foreach ($this->adminPermissions as $name) {
            Permission::firstOrCreate(
                ['name' => $name, 'guard_name' => 'admin'],
                ['name' => $name, 'guard_name' => 'admin']
            );
        }

        foreach ($this->webRoles as $roleName => $permissionNames) {
            $role = Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => 'web'],
                ['name' => $roleName, 'guard_name' => 'web']
            );
            $role->syncPermissions($permissionNames);
        }

        foreach ($this->adminRoles as $roleName => $permissionNames) {
            $role = Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => 'admin'],
                ['name' => $roleName, 'guard_name' => 'admin']
            );
            $role->syncPermissions($permissionNames);
        }

        $superAdmin = Role::firstOrCreate(
            ['name' => 'super_admin', 'guard_name' => 'admin'],
            ['name' => 'super_admin', 'guard_name' => 'admin']
        );
        $superAdmin->syncPermissions($this->adminPermissions);

        $admin = User::firstOrCreate(
            ['email' => 'softwareteam@gmail.com'],
            [
                'name' => 'Platform Admin',
                'email' => 'softwareteam@gmail.com',
                'password' => Hash::make('password'),
                'is_admin_account' => true,
                'account_status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        // NOTE: User::$guard_name is pinned to 'web', so assignRole() would
        // reject this admin-guard role (GuardDoesNotMatch). Attach directly —
        // the pivot row is identical to what assignRole() would write.
        $admin->roles()->syncWithoutDetaching([$superAdmin->getKey()]);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->command->info('Car Selling roles, permissions and super admin seeded.');
    }
}
