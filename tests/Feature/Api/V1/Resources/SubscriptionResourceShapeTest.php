<?php

use App\Models\Package;
use App\Models\Showroom;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('subscription resource exposes the exact public shape', function () {
    $owner = User::factory()->create();
    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Subscription Motors',
        'slug' => 'subscription-motors',
        'phone' => '09999999999',
        'address' => 'Yangon',
    ]);
    $showroom->users()->attach($owner->id, [
        'member_role' => 'owner',
        'is_active' => true,
        'joined_at' => now(),
    ]);

    $package = Package::create([
        'name' => 'Starter',
        'slug' => 'starter',
        'price_amount' => 50000,
        'currency' => 'MMK',
        'duration_days' => 30,
        'active_listing_limit' => 10,
        'is_active' => true,
    ]);

    $subscription = Subscription::create([
        'showroom_id' => $showroom->id,
        'package_id' => $package->id,
        'status' => 'active',
        'active_listing_limit_snapshot' => 10,
        'price_amount_snapshot' => 50000,
        'currency_snapshot' => 'MMK',
    ]);

    $this->actingAs($owner, 'sanctum')
        ->getJson('/api/v1/showroom/subscription')
        ->assertOk()
        ->assertJsonStructure(['data' => [
            'id', 'status', 'starts_at', 'ends_at', 'active_listing_limit',
            'price', 'currency', 'listings_used',
            'package' => ['id', 'name', 'slug', 'price', 'currency', 'duration_days'],
            'created_at',
        ]])
        ->assertJsonMissing(['storage_key', 'password'])
        ->assertJsonPath('data.id', 'subscription_'.$subscription->uuid)
        ->assertJsonPath('data.status', 'active')
        ->assertJsonPath('data.price', 50000)
        ->assertJsonPath('data.package.id', 'package_'.$package->uuid);
});
