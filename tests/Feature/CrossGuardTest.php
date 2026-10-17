<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('updating a user with web and admin guard roles does not throw GuardDoesNotMatch', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::create(['name' => 'user', 'guard_name' => 'web'])->id);
    // Pass the AdminOnly middleware (any permission grants area access).
    $admin->givePermissionTo(\Spatie\Permission\Models\Permission::create(['name' => 'view_users', 'guard_name' => 'web']));

    $target = User::factory()->create();
    $superAdmin = Role::create(['name' => 'super_admin', 'guard_name' => 'admin']);
    $buyer = Role::create(['name' => 'buyer', 'guard_name' => 'web']);

    $response = $this->actingAs($admin)->put("/users/{$target->id}", [
        'name' => $target->name,
        'email' => $target->email,
        'roles' => [$superAdmin->id, $buyer->id],
    ]);

    $response->assertRedirect(route('users.show', $target));
    expect($target->fresh()->getRoleNames()->toArray())->toContain('super_admin', 'buyer');
});

test('syncing a role with cross-guard permissions drops the mismatch instead of throwing', function () {
    $webPerm = \Spatie\Permission\Models\Permission::create(['name' => 'browse cars', 'guard_name' => 'web']);
    $adminPerm = \Spatie\Permission\Models\Permission::create(['name' => 'access admin panel', 'guard_name' => 'admin']);
    $role = Role::create(['name' => 'mixed-test', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->roles()->attach(Role::create(['name' => 'user', 'guard_name' => 'web'])->id);
    $admin->givePermissionTo(\Spatie\Permission\Models\Permission::create(['name' => 'view_roles', 'guard_name' => 'web']));

    // Web role + admin permission id must not throw GuardDoesNotMatch.
    $this->actingAs($admin)->put("/roles/{$role->id}", [
        'name' => 'mixed-test',
        'permissions' => [$webPerm->id, $adminPerm->id],
    ])->assertRedirect(route('roles.index'));

    expect($role->fresh()->permissions->pluck('name')->toArray())->toBe(['browse cars']);
});
