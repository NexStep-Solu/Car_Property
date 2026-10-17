<?php

use App\Models\AuditLog;
use App\Models\Car;
use App\Models\Package;
use App\Models\Report;
use App\Models\SellerProfile;
use App\Models\Showroom;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function dashboardTestAdmin(array $permissions = []): User
{
    $admin = User::factory()->create(['is_admin_account' => true]);

    $role = Role::firstOrCreate(
        ['name' => 'super_admin', 'guard_name' => 'admin'],
        ['name' => 'super_admin', 'guard_name' => 'admin']
    );

    foreach ($permissions as $name) {
        $permission = Permission::firstOrCreate(
            ['name' => $name, 'guard_name' => 'admin'],
            ['name' => $name, 'guard_name' => 'admin']
        );
        $role->givePermissionTo($permission);
    }

    // User::$guard_name is pinned to 'web'; attach the admin-guard role via pivot.
    $admin->roles()->attach($role->id);

    return $admin;
}

function dashboardTestShowroom(): array
{
    $owner = User::factory()->create();
    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Dashboard Motors '.uniqid(),
        'slug' => 'dashboard-motors-'.uniqid(),
        'phone' => '09999999999',
        'address' => 'Yangon',
    ]);
    $showroom->users()->attach($owner->id, [
        'member_role' => 'owner',
        'is_active' => true,
        'joined_at' => now(),
    ]);

    return [$owner, $showroom];
}

function dashboardTestPackage(): Package
{
    return Package::create([
        'name' => 'Starter',
        'slug' => 'starter-'.uniqid(),
        'price_amount' => 50000,
        'currency' => 'MMK',
        'duration_days' => 30,
        'active_listing_limit' => 10,
        'is_active' => true,
    ]);
}

test('admin dashboard requires authentication', function () {
    $this->getJson('/api/v1/admin/dashboard')
        ->assertUnauthorized()
        ->assertJsonPath('error.code', 'AUTHENTICATION_REQUIRED');
});

test('admin dashboard is denied without dashboard.view', function () {
    $admin = dashboardTestAdmin();

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/dashboard')
        ->assertForbidden()
        ->assertJsonPath('error.code', 'PERMISSION_DENIED');
});

test('dashboard returns platform counters', function () {
    $admin = dashboardTestAdmin(['dashboard.view']);

    $seller = User::factory()->create();
    SellerProfile::create([
        'user_id' => $seller->id, 'seller_type' => 'individual',
        'display_name' => 'Pending Seller', 'verification_status' => 'pending',
    ]);
    $approvedSeller = User::factory()->create();
    SellerProfile::create([
        'user_id' => $approvedSeller->id, 'seller_type' => 'individual',
        'display_name' => 'Approved Seller', 'verification_status' => 'approved',
    ]);

    [, $approvedShowroom] = dashboardTestShowroom();
    $approvedShowroom->update(['verification_status' => 'approved']);
    dashboardTestShowroom();

    Car::factory()->create(['seller_user_id' => $seller->id, 'status' => 'pending_review']);
    $publishedCar = Car::factory()->create(['seller_user_id' => $seller->id, 'status' => 'published']);

    $package = dashboardTestPackage();
    [, $activeShowroom] = dashboardTestShowroom();
    $activeShowroom->update(['verification_status' => 'approved']);
    Subscription::create([
        'showroom_id' => $activeShowroom->id, 'package_id' => $package->id,
        'status' => 'active', 'active_listing_limit_snapshot' => 10,
        'price_amount_snapshot' => 50000, 'currency_snapshot' => 'MMK',
    ]);
    [, $expiredShowroom] = dashboardTestShowroom();
    $expiredShowroom->update(['verification_status' => 'approved']);
    Subscription::create([
        'showroom_id' => $expiredShowroom->id, 'package_id' => $package->id,
        'status' => 'expired', 'active_listing_limit_snapshot' => 10,
        'price_amount_snapshot' => 50000, 'currency_snapshot' => 'MMK',
    ]);

    $reporter = User::factory()->create();
    Report::create([
        'reporter_user_id' => $reporter->id, 'target_type' => 'car',
        'target_id' => $publishedCar->id, 'reason' => 'spam', 'status' => 'open',
    ]);
    Report::create([
        'reporter_user_id' => $reporter->id, 'target_type' => 'car',
        'target_id' => $publishedCar->id, 'reason' => 'fraud', 'status' => 'resolved',
        'handled_by' => $admin->id, 'resolved_at' => now(),
    ]);

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/dashboard')
        ->assertOk()
        ->assertJsonPath('data.pending_sellers', 1)
        ->assertJsonPath('data.pending_showrooms', 1)
        ->assertJsonPath('data.pending_cars', 1)
        ->assertJsonPath('data.total_users', User::count())
        ->assertJsonPath('data.total_published_cars', 1)
        ->assertJsonPath('data.active_subscriptions', 1)
        ->assertJsonPath('data.open_reports', 1);
});

test('users index is denied without users.view', function () {
    $admin = dashboardTestAdmin();

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/users')
        ->assertForbidden()
        ->assertJsonPath('error.code', 'PERMISSION_DENIED');
});

test('users index supports search and filters', function () {
    $admin = dashboardTestAdmin(['users.view']);

    User::factory()->create(['name' => 'Alice Searchable', 'account_status' => 'active']);
    User::factory()->create(['name' => 'Bob Suspended', 'account_status' => 'suspended']);

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/users')
        ->assertOk()
        ->assertJsonPath('meta.total', 3);

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/users?q=Alice')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Alice Searchable');

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/users?status=suspended')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Bob Suspended');

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/users?is_admin_account=1')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', $admin->name);
});

test('user detail returns the account profile', function () {
    $admin = dashboardTestAdmin(['users.view']);
    $seller = User::factory()->create();

    SellerProfile::create([
        'user_id' => $seller->id, 'seller_type' => 'individual',
        'display_name' => 'Detail Seller', 'verification_status' => 'pending',
    ]);

    Role::firstOrCreate(['name' => 'buyer', 'guard_name' => 'web'], ['name' => 'buyer', 'guard_name' => 'web']);
    $seller->assignRole('buyer');

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/users/'.$seller->uuid)
        ->assertOk()
        ->assertJsonPath('data.id', 'user_'.$seller->uuid)
        ->assertJsonPath('data.seller_profile.display_name', 'Detail Seller')
        ->assertJsonPath('data.roles.0', 'buyer');

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/users/'.Str::uuid())
        ->assertNotFound()
        ->assertJsonPath('error.code', 'RESOURCE_NOT_FOUND');
});

test('user status update requires users.manage', function () {
    $admin = dashboardTestAdmin(['users.view']);
    $target = User::factory()->create();

    $this->actingAs($admin, 'admin')
        ->patchJson("/api/v1/admin/users/{$target->uuid}/status", ['status' => 'suspended'])
        ->assertForbidden()
        ->assertJsonPath('error.code', 'PERMISSION_DENIED');

    expect($target->fresh()->account_status)->toBe('active');
});

test('admin can suspend and reactivate a user', function () {
    $admin = dashboardTestAdmin(['users.manage']);
    $target = User::factory()->create(['account_status' => 'active']);

    $this->actingAs($admin, 'admin')
        ->patchJson("/api/v1/admin/users/{$target->uuid}/status", [
            'status' => 'suspended',
            'reason' => 'Spam listings',
        ])
        ->assertOk()
        ->assertJsonPath('data.account_status', 'suspended');

    expect($target->fresh()->account_status)->toBe('suspended');

    $log = AuditLog::where('action', 'user.status_changed')->first();

    expect($log)->not->toBeNull()
        ->and($log->target_id)->toBe((string) $target->id)
        ->and($log->reason)->toBe('Spam listings')
        ->and($log->actor_user_id)->toBe($admin->id)
        ->and($log->metadata_json)->toBe(['from' => 'active', 'to' => 'suspended']);

    $this->actingAs($admin, 'admin')
        ->patchJson("/api/v1/admin/users/{$target->uuid}/status", ['status' => 'active'])
        ->assertOk()
        ->assertJsonPath('data.account_status', 'active');

    expect($target->fresh()->account_status)->toBe('active');
});

test('user status update validates input and blocks self changes', function () {
    $admin = dashboardTestAdmin(['users.manage']);
    $target = User::factory()->create();

    $this->actingAs($admin, 'admin')
        ->patchJson("/api/v1/admin/users/{$target->uuid}/status", ['status' => 'banned'])
        ->assertUnprocessable()
        ->assertJsonPath('error.code', 'VALIDATION_ERROR');

    $this->actingAs($admin, 'admin')
        ->patchJson("/api/v1/admin/users/{$admin->uuid}/status", ['status' => 'suspended'])
        ->assertUnprocessable()
        ->assertJsonPath('error.code', 'VALIDATION_ERROR');

    expect($admin->fresh()->account_status)->toBe('active');
});

test('audit logs are denied without audit_logs.view', function () {
    $admin = dashboardTestAdmin();

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/audit-logs')
        ->assertForbidden()
        ->assertJsonPath('error.code', 'PERMISSION_DENIED');
});

test('audit logs can be filtered', function () {
    $admin = dashboardTestAdmin(['audit_logs.view']);
    $actor = User::factory()->create(['name' => 'Auditor Naming']);
    $target = User::factory()->create();

    AuditLog::create([
        'actor_user_id' => $actor->id, 'action' => 'car.approved',
        'target_type' => 'car', 'target_id' => '1',
    ]);
    AuditLog::create([
        'actor_user_id' => $actor->id, 'action' => 'user.status_changed',
        'target_type' => 'user', 'target_id' => (string) $target->id,
    ]);

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/audit-logs')
        ->assertOk()
        ->assertJsonPath('meta.total', 2)
        ->assertJsonPath('data.0.action', 'user.status_changed');

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/audit-logs?action=car.approved')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.action', 'car.approved');

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/audit-logs?target_type=user')
        ->assertOk()
        ->assertJsonCount(1, 'data');

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/audit-logs?actor=Auditor')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.actor.name', 'Auditor Naming');
});
