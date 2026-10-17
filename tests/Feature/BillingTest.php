<?php

use App\Models\Package;
use App\Models\Showroom;
use App\Models\Subscription;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function makeBillingShowroom(): array
{
    $owner = User::factory()->create();
    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Billing Motors',
        'slug' => 'billing-motors-'.uniqid(),
        'phone' => '09444444444',
        'address' => 'Somewhere',
    ]);
    $showroom->users()->attach($owner->id, [
        'member_role' => 'owner',
        'is_active' => true,
        'joined_at' => now(),
    ]);

    return [$owner, $showroom];
}

function makeBillingSuperAdmin(): User
{
    $admin = User::factory()->create();
    $role = \Spatie\Permission\Models\Role::firstOrCreate(
        ['name' => 'super_admin', 'guard_name' => 'admin'],
        ['name' => 'super_admin', 'guard_name' => 'admin']
    );
    $admin->roles()->attach($role->id);

    return $admin;
}

test('owner can purchase a package and super admin confirm activates it', function () {
    [$owner, $showroom] = makeBillingShowroom();
    $admin = makeBillingSuperAdmin();

    $package = Package::create([
        'name' => 'Pro Monthly',
        'slug' => 'pro-monthly',
        'price_amount' => 50000,
        'currency' => 'MMK',
        'duration_days' => 30,
        'active_listing_limit' => 10,
    ]);

    $response = $this->actingAs($owner)->post('/subscriptions', [
        'showroom_id' => $showroom->id,
        'package_id' => $package->id,
    ]);

    $subscription = Subscription::first();
    expect($subscription->status->value)->toBe('pending_payment');
    expect($subscription->price_amount_snapshot)->toBe(50000);
    $response->assertRedirect(route('subscriptions.show', $subscription));

    $payResponse = $this->actingAs($owner)->post('/payments', [
        'subscription_id' => $subscription->id,
        'provider' => 'manual',
        'amount' => 50000,
        'currency' => 'MMK',
    ]);

    $payment = \App\Models\Payment::first();
    expect($payment->status->value)->toBe('pending');
    expect($payment->idempotency_key)->not->toBeNull();
    $payResponse->assertRedirect(route('payments.show', $payment));

    $this->actingAs($admin)->post("/payments/{$payment->id}/confirm")->assertRedirect();

    expect($payment->fresh()->status->value)->toBe('succeeded');
    expect($payment->fresh()->paid_at)->not->toBeNull();
    expect($subscription->fresh()->status->value)->toBe('active');
    expect($subscription->fresh()->ends_at)->not->toBeNull();
});

test('non super admin cannot manage packages', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/packages')->assertForbidden();
    $this->actingAs($user)->post('/packages', [
        'name' => 'Nope',
        'price_amount' => 100,
        'currency' => 'MMK',
        'duration_days' => 30,
        'active_listing_limit' => 5,
        'expired_ads_action' => 'hide',
    ])->assertForbidden();
});
