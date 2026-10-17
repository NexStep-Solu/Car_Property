<?php

use App\Models\Showroom;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('owner can create a showroom and becomes an owner member', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/showrooms', [
        'business_name' => 'Yangon Motors',
        'phone' => '09123456789',
        'address' => 'No 1, Pyay Road',
    ]);

    $showroom = Showroom::where('slug', 'yangon-motors')->first();
    expect($showroom)->not->toBeNull();
    expect($showroom->owner_user_id)->toBe($user->id);
    expect($showroom->verification_status->value)->toBe('pending');
    expect($showroom->users()->where('users.id', $user->id)->first()->pivot->member_role)->toBe('owner');
    $response->assertRedirect(route('showrooms.show', $showroom));
});

test('non members cannot view a showroom', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();

    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Hidden Motors',
        'slug' => 'hidden-motors',
        'phone' => '09000000000',
        'address' => 'Somewhere',
    ]);

    $this->actingAs($stranger)->get("/showrooms/{$showroom->id}")->assertForbidden();
});

test('reviewer can approve a showroom', function () {
    $owner = User::factory()->create();
    $reviewer = User::factory()->create();
    $reviewerRole = \Spatie\Permission\Models\Role::firstOrCreate(
        ['name' => 'reviewer', 'guard_name' => 'admin'],
        ['name' => 'reviewer', 'guard_name' => 'admin']
    );
    // Direct attach: User::$guard_name is pinned to 'web', so assignRole()
    // would reject this admin-guard role (same as the seeder does).
    $reviewer->roles()->attach($reviewerRole->id);

    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Review Motors',
        'slug' => 'review-motors',
        'phone' => '09111111111',
        'address' => 'Somewhere',
    ]);

    $this->actingAs($reviewer)->post("/showrooms/{$showroom->id}/status", [
        'verification_status' => 'approved',
    ])->assertRedirect();

    expect($showroom->fresh()->verification_status->value)->toBe('approved');
    expect($showroom->fresh()->approved_at)->not->toBeNull();
});
