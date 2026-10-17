<?php

use App\Models\Package;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('package resource exposes the exact public shape', function () {
    $package = Package::create([
        'name' => 'Premium',
        'slug' => 'premium',
        'description' => 'Top tier package.',
        'price_amount' => 150000,
        'currency' => 'MMK',
        'duration_days' => 90,
        'active_listing_limit' => 50,
        'featured_ads_limit' => 5,
        'expired_ads_action' => 'hide',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $this->getJson('/api/v1/packages/'.$package->slug)
        ->assertOk()
        ->assertJsonStructure(['data' => [
            'id', 'name', 'slug', 'description', 'price', 'currency',
            'duration_days', 'active_listing_limit', 'featured_ads_limit',
            'features', 'expired_ads_action', 'is_active', 'sort_order',
        ]])
        ->assertJsonMissing(['storage_key', 'password'])
        ->assertJsonPath('data.id', 'package_'.$package->uuid)
        ->assertJsonPath('data.price', 150000)
        ->assertJsonPath('data.currency', 'MMK')
        ->assertJsonPath('data.expired_ads_action', 'hide');
});
