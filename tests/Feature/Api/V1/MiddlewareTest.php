<?php

use App\Models\Showroom;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function middlewareTestShowroom(): array
{
    $owner = User::factory()->create();
    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Middleware Motors',
        'slug' => 'middleware-motors',
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

test('showroom member middleware sets the team context and restores it after the request', function () {
    [$owner, $showroom] = middlewareTestShowroom();

    Route::middleware(['auth:sanctum', 'showroom.member'])->get('/api/v1/__test/team-context', function (Request $request) {
        return response()->json([
            'team_id' => app(PermissionRegistrar::class)->getPermissionsTeamId(),
            'showroom_id' => $request->attributes->get('showroom')->id,
            'is_owner' => $request->attributes->get('showroom_is_owner'),
            'is_super_admin' => $request->attributes->get('showroom_is_super_admin'),
        ]);
    });

    $this->actingAs($owner, 'sanctum')
        ->getJson('/api/v1/__test/team-context')
        ->assertOk()
        ->assertJsonPath('team_id', $showroom->id)
        ->assertJsonPath('showroom_id', $showroom->id)
        ->assertJsonPath('is_owner', true)
        ->assertJsonPath('is_super_admin', false);

    expect(app(PermissionRegistrar::class)->getPermissionsTeamId())->toBeNull();
});

test('non members are rejected with permission denied', function () {
    [, $showroom] = middlewareTestShowroom();
    $outsider = User::factory()->create();

    Route::middleware(['auth:sanctum', 'showroom.member'])->get('/api/v1/__test/showroom/{showroom}', function (Request $request) {
        return response()->json(['ok' => true]);
    });

    $this->actingAs($outsider, 'sanctum')
        ->getJson('/api/v1/__test/showroom/'.$showroom->id)
        ->assertForbidden()
        ->assertJsonPath('error.code', 'PERMISSION_DENIED');
});

test('super admin passes the showroom member middleware without membership', function () {
    [, $showroom] = middlewareTestShowroom();

    $role = Role::firstOrCreate(
        ['name' => 'super_admin', 'guard_name' => 'admin'],
        ['name' => 'super_admin', 'guard_name' => 'admin']
    );
    $superAdmin = User::factory()->create();
    $superAdmin->roles()->attach($role->id);

    Route::middleware(['auth:sanctum', 'showroom.member'])->get('/api/v1/__test/super/{showroom}', function (Request $request) {
        return response()->json([
            'team_id' => app(PermissionRegistrar::class)->getPermissionsTeamId(),
            'is_super_admin' => $request->attributes->get('showroom_is_super_admin'),
        ]);
    });

    $this->actingAs($superAdmin, 'sanctum')
        ->getJson('/api/v1/__test/super/'.$showroom->id)
        ->assertOk()
        ->assertJsonPath('team_id', $showroom->id)
        ->assertJsonPath('is_super_admin', true);

    expect(app(PermissionRegistrar::class)->getPermissionsTeamId())->toBeNull();
});

test('auth endpoints are rate limited to five attempts per minute', function () {
    foreach (range(1, 5) as $attempt) {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nobody@example.com',
            'password' => 'wrong-password',
        ]);

        expect($response->status())->not->toBe(429);
    }

    $this->postJson('/api/v1/auth/login', [
        'email' => 'nobody@example.com',
        'password' => 'wrong-password',
    ])
        ->assertStatus(429)
        ->assertJsonPath('error.code', 'RATE_LIMIT_EXCEEDED');
});
