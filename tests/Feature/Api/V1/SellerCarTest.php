<?php

use App\Models\Car;
use App\Models\Package;
use App\Models\SellerProfile;
use App\Models\Showroom;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function sellerWithPerm(string $perm = 'manage own listings'): User
{
    $permission = Permission::firstOrCreate(
        ['name' => $perm, 'guard_name' => 'web'],
        ['name' => $perm, 'guard_name' => 'web']
    );
    $role = Role::firstOrCreate(
        ['name' => 'individual_seller', 'guard_name' => 'web'],
        ['name' => 'individual_seller', 'guard_name' => 'web']
    );
    $role->givePermissionTo($permission);

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function approvedSeller(): User
{
    $user = sellerWithPerm();
    SellerProfile::create([
        'user_id' => $user->id,
        'seller_type' => 'individual',
        'display_name' => $user->name,
        'verification_status' => 'approved',
        'approved_at' => now(),
    ]);

    return $user;
}

function sellerCarPayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'Seller Car',
        'year' => 2020,
        'price' => 15000,
        'currency' => 'USD',
        'location' => 'Yangon',
        'condition' => 'used',
    ], $overrides);
}

test('approved seller can create car', function () {
    $seller = approvedSeller();

    $response = $this->actingAs($seller, 'sanctum')->postJson('/api/v1/seller/cars', sellerCarPayload());

    $response->assertCreated()->assertJsonPath('data.status', 'draft');
    expect(Car::where('seller_user_id', $seller->id)->count())->toBe(1);
});

test('unapproved seller cannot create car', function () {
    $seller = sellerWithPerm();

    $this->actingAs($seller, 'sanctum')->postJson('/api/v1/seller/cars', sellerCarPayload())
        ->assertForbidden()
        ->assertJsonPath('error.code', 'SELLER_NOT_APPROVED');
});

test('showroom with package limit blocks over-limit listing', function () {
    $owner = sellerWithPerm();
    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Limit Motors',
        'slug' => 'limit-motors',
        'phone' => '09111111111',
        'address' => 'X',
        'verification_status' => 'approved',
    ]);

    $package = Package::create([
        'name' => 'Tiny', 'slug' => 'tiny', 'price_amount' => 100,
        'currency' => 'MMK', 'duration_days' => 30, 'active_listing_limit' => 1,
    ]);
    Subscription::create([
        'showroom_id' => $showroom->id,
        'package_id' => $package->id,
        'status' => 'active',
        'active_listing_limit_snapshot' => 1,
        'price_amount_snapshot' => 100,
        'currency_snapshot' => 'MMK',
    ]);

    Car::create([
        'showroom_id' => $showroom->id, 'title' => 'Existing', 'year' => 2020,
        'price_amount' => 1000, 'currency' => 'MMK', 'location' => 'Y',
        'condition' => 'used', 'status' => 'published',
    ]);

    $this->actingAs($owner, 'sanctum')->postJson('/api/v1/seller/cars', sellerCarPayload([
        'showroom_id' => $showroom->id,
    ]))->assertStatus(422)->assertJsonPath('error.code', 'LISTING_LIMIT_REACHED');
});

test('owner can update own car', function () {
    $seller = approvedSeller();
    $car = Car::create([
        'seller_user_id' => $seller->id, 'title' => 'Old Title', 'year' => 2020,
        'price_amount' => 1000, 'currency' => 'USD', 'location' => 'Y',
        'condition' => 'used', 'status' => 'draft',
    ]);

    $this->actingAs($seller, 'sanctum')->patchJson("/api/v1/seller/cars/{$car->uuid}", [
        'title' => 'New Title',
    ])->assertOk()->assertJsonPath('data.title', 'New Title');
});

test('non-owner cannot update', function () {
    $seller = approvedSeller();
    $stranger = sellerWithPerm();
    $car = Car::create([
        'seller_user_id' => $seller->id, 'title' => 'Mine', 'year' => 2020,
        'price_amount' => 1000, 'currency' => 'USD', 'location' => 'Y',
        'condition' => 'used', 'status' => 'draft',
    ]);

    $this->actingAs($stranger, 'sanctum')->patchJson("/api/v1/seller/cars/{$car->uuid}", [
        'title' => 'Hijacked',
    ])->assertNotFound();
});

test('submitting sets status pending_review', function () {
    $seller = approvedSeller();
    $car = Car::create([
        'seller_user_id' => $seller->id, 'title' => 'Submit Me', 'year' => 2021,
        'price_amount' => 2000, 'currency' => 'USD', 'location' => 'Y',
        'condition' => 'used', 'status' => 'draft',
    ]);

    $this->actingAs($seller, 'sanctum')->postJson("/api/v1/seller/cars/{$car->uuid}/submit")
        ->assertOk()->assertJsonPath('data.status', 'pending_review');
});

test('image upload works', function () {
    Storage::fake('public');
    $seller = approvedSeller();
    $car = Car::create([
        'seller_user_id' => $seller->id, 'title' => 'Photo Car', 'year' => 2022,
        'price_amount' => 3000, 'currency' => 'USD', 'location' => 'Y',
        'condition' => 'new', 'status' => 'draft',
    ]);

    $this->actingAs($seller, 'sanctum')->post("/api/v1/seller/cars/{$car->uuid}/images", [
        'image' => UploadedFile::fake()->image('car.jpg'),
    ])->assertCreated();

    expect($car->images()->count())->toBe(1);
});

test('mark-sold sets status sold', function () {
    $seller = approvedSeller();
    $car = Car::create([
        'seller_user_id' => $seller->id, 'title' => 'Sold Car', 'year' => 2019,
        'price_amount' => 4000, 'currency' => 'USD', 'location' => 'Y',
        'condition' => 'used', 'status' => 'published',
    ]);

    $this->actingAs($seller, 'sanctum')->postJson("/api/v1/seller/cars/{$car->uuid}/mark-sold")
        ->assertOk()->assertJsonPath('data.status', 'sold');

    expect($car->fresh()->sold_at)->not->toBeNull();
});
