<?php

use App\Models\Package;
use App\Models\Showroom;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('payment resource exposes the exact public shape', function () {
    $owner = User::factory()->create();
    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Payment Motors',
        'slug' => 'payment-motors',
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

    $checkout = $this->actingAs($owner, 'sanctum')->postJson('/api/v1/showroom/subscriptions', [
        'package_id' => $package->id,
        'provider' => 'manual',
    ])->assertCreated();

    $this->actingAs($owner, 'sanctum')
        ->getJson('/api/v1/showroom/payments')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [[
                'id', 'provider', 'provider_reference', 'amount', 'currency',
                'status', 'paid_at',
                'subscription' => ['id', 'status', 'price', 'currency'],
                'payer' => ['id', 'name', 'email', 'account_status'],
                'created_at',
            ]],
            'meta' => ['current_page', 'per_page', 'total'],
        ])
        ->assertJsonMissing(['storage_key', 'password', 'provider_payload_safe'])
        ->assertJsonPath('data.0.id', $checkout->json('data.payment.id'))
        ->assertJsonPath('data.0.amount', 50000)
        ->assertJsonPath('data.0.status', 'pending')
        ->assertJsonPath('data.0.payer.id', 'user_'.$owner->uuid);
});
