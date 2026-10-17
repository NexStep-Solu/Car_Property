<?php

use App\Models\Car;
use App\Models\Showroom;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function makePolicyOwner(): array
{
    $owner = User::factory()->create();
    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Policy Motors',
        'slug' => 'policy-motors-'.uniqid(),
        'phone' => '09555555555',
        'address' => 'Somewhere',
    ]);

    return [$owner, $showroom];
}

function attachAdminRole(User $user, string $role): void
{
    $roleModel = \Spatie\Permission\Models\Role::firstOrCreate(
        ['name' => $role, 'guard_name' => 'admin'],
        ['name' => $role, 'guard_name' => 'admin']
    );
    $user->roles()->attach($roleModel->id);
}

test('policies auto-resolve and car update allows owner but denies stranger', function () {
    [$owner, $showroom] = makePolicyOwner();
    $stranger = User::factory()->create();

    $car = Car::create([
        'showroom_id' => $showroom->id,
        'title' => 'Policy Car',
        'year' => 2020,
        'price_amount' => 10000,
        'currency' => 'USD',
        'location' => 'Yangon',
        'condition' => 'used',
        'status' => 'draft',
    ]);

    expect(Gate::forUser($owner)->allows('update', $car))->toBeTrue();
    expect(Gate::forUser($stranger)->allows('update', $car))->toBeFalse();
    expect(Gate::forUser($stranger)->allows('view', $car))->toBeFalse();

    // Team resolver state is restored after team-scoped checks.
    expect(app(\Spatie\Permission\PermissionRegistrar::class)->getPermissionsTeamId())->toBeNull();
});

test('reviewer can approve cars and handle reports via policies', function () {
    [$owner, $showroom] = makePolicyOwner();
    $reviewer = User::factory()->create();
    attachAdminRole($reviewer, 'reviewer');

    $car = Car::create([
        'showroom_id' => $showroom->id,
        'title' => 'Review Car',
        'year' => 2021,
        'price_amount' => 5000,
        'currency' => 'USD',
        'location' => 'Mandalay',
        'condition' => 'used',
        'status' => 'pending_review',
    ]);

    $perm = \Spatie\Permission\Models\Permission::firstOrCreate(
        ['name' => 'approve cars', 'guard_name' => 'admin'],
        ['name' => 'approve cars', 'guard_name' => 'admin']
    );
    $reviewer->roles()->first()->givePermissionTo($perm);

    expect(Gate::forUser($reviewer)->allows('approve', $car))->toBeTrue();
    expect(Gate::forUser($owner)->allows('approve', $car))->toBeFalse();

    $report = \App\Models\Report::create([
        'reporter_user_id' => $owner->id,
        'target_type' => 'car',
        'target_id' => $car->id,
        'reason' => 'spam',
        'status' => 'open',
    ]);

    expect(Gate::forUser($reviewer)->allows('handle', $report))->toBeFalse();

    $handle = \Spatie\Permission\Models\Permission::firstOrCreate(
        ['name' => 'handle reports', 'guard_name' => 'admin'],
        ['name' => 'handle reports', 'guard_name' => 'admin']
    );
    $reviewer->roles()->first()->givePermissionTo($handle);

    expect(Gate::forUser($reviewer)->allows('handle', $report))->toBeTrue();
});

test('middleware aliases are registered', function () {
    $middleware = app('router')->getMiddleware();

    expect($middleware)->toHaveKey('admin');
    expect($middleware)->toHaveKey('showroom.member');
});
