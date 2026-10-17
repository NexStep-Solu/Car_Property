<?php

use App\Models\Package;
use App\Models\Payment;
use App\Models\PaymentWebhookEvent;
use App\Models\Showroom;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function paymentTestPackage(array $overrides = []): Package
{
    return Package::create(array_merge([
        'name' => 'Starter',
        'slug' => 'starter-'.uniqid(),
        'price_amount' => 50000,
        'currency' => 'MMK',
        'duration_days' => 30,
        'active_listing_limit' => 10,
        'is_active' => true,
    ], $overrides));
}

function paymentTestShowroom(): array
{
    $owner = User::factory()->create();
    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Checkout Motors',
        'slug' => 'checkout-motors-'.uniqid(),
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

function paymentTestAdmin(): User
{
    $admin = User::factory()->create();

    $role = Role::firstOrCreate(
        ['name' => 'super_admin', 'guard_name' => 'admin'],
        ['name' => 'super_admin', 'guard_name' => 'admin']
    );

    foreach (['packages.manage', 'payments.manage'] as $name) {
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

function webhookSignature(array $payload, string $secret = 'test-secret'): string
{
    return hash_hmac('sha256', json_encode($payload), $secret);
}

test('packages list is public', function () {
    $active = paymentTestPackage();
    $inactive = paymentTestPackage(['name' => 'Legacy', 'is_active' => false]);

    $this->getJson('/api/v1/packages')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', $active->name);

    $this->getJson("/api/v1/packages/{$active->slug}")->assertOk();
    $this->getJson("/api/v1/packages/{$inactive->slug}")->assertNotFound();
});

test('showroom can start checkout', function () {
    [$owner] = paymentTestShowroom();
    $package = paymentTestPackage();

    $this->actingAs($owner, 'sanctum')->postJson('/api/v1/showroom/subscriptions', [
        'package_id' => $package->id,
        'provider' => 'manual',
    ])->assertCreated()
        ->assertJsonPath('data.subscription.status', 'pending_payment')
        ->assertJsonPath('data.payment.status', 'pending');

    $subscription = Subscription::first();
    expect($subscription->status->value)->toBe('pending_payment')
        ->and($subscription->price_amount_snapshot)->toBe(50000)
        ->and($subscription->active_listing_limit_snapshot)->toBe(10);

    $payment = Payment::first();
    expect($payment->status->value)->toBe('pending')
        ->and($payment->provider)->toBe('manual')
        ->and($payment->provider_reference)->not->toBeNull()
        ->and($payment->idempotency_key)->not->toBeNull();
});

test('webhook with duplicate event_id is idempotent', function () {
    config()->set('services.payments.providers.manual.webhook_secret', 'test-secret');

    [$owner] = paymentTestShowroom();
    $package = paymentTestPackage();

    $this->actingAs($owner, 'sanctum')->postJson('/api/v1/showroom/subscriptions', [
        'package_id' => $package->id,
    ])->assertCreated();

    $payment = Payment::first();
    $payload = [
        'event_id' => 'evt_dup_1',
        'event_type' => 'payment.succeeded',
        'provider_reference' => $payment->provider_reference,
    ];

    $this->withHeaders(['X-Webhook-Signature' => webhookSignature($payload)])
        ->postJson('/api/v1/webhooks/payments/manual', $payload)
        ->assertCreated();

    $this->withHeaders(['X-Webhook-Signature' => webhookSignature($payload)])
        ->postJson('/api/v1/webhooks/payments/manual', $payload)
        ->assertOk()
        ->assertJsonPath('data.duplicate', true);

    expect(PaymentWebhookEvent::count())->toBe(1)
        ->and($payment->fresh()->status->value)->toBe('succeeded');
});

test('webhook with invalid signature is rejected', function () {
    config()->set('services.payments.providers.manual.webhook_secret', 'test-secret');

    [$owner] = paymentTestShowroom();
    $package = paymentTestPackage();

    $this->actingAs($owner, 'sanctum')->postJson('/api/v1/showroom/subscriptions', [
        'package_id' => $package->id,
    ])->assertCreated();

    $payment = Payment::first();
    $payload = [
        'event_id' => 'evt_bad_1',
        'event_type' => 'payment.succeeded',
        'provider_reference' => $payment->provider_reference,
    ];

    $this->withHeaders(['X-Webhook-Signature' => 'not-a-valid-signature'])
        ->postJson('/api/v1/webhooks/payments/manual', $payload)
        ->assertUnauthorized()
        ->assertJsonPath('error.code', 'INVALID_SIGNATURE');

    expect(PaymentWebhookEvent::count())->toBe(0)
        ->and($payment->fresh()->status->value)->toBe('pending');
});

test('subscription activates only after confirmed payment', function () {
    config()->set('services.payments.providers.manual.webhook_secret', 'test-secret');

    [$owner] = paymentTestShowroom();
    $package = paymentTestPackage();

    $this->actingAs($owner, 'sanctum')->postJson('/api/v1/showroom/subscriptions', [
        'package_id' => $package->id,
    ])->assertCreated();

    $subscription = Subscription::first();
    $payment = Payment::first();

    expect($subscription->status->value)->toBe('pending_payment')
        ->and($payment->status->value)->toBe('pending');

    $payload = [
        'event_id' => 'evt_ok_1',
        'event_type' => 'payment.succeeded',
        'provider_reference' => $payment->provider_reference,
    ];

    $this->withHeaders(['X-Webhook-Signature' => webhookSignature($payload)])
        ->postJson('/api/v1/webhooks/payments/manual', $payload)
        ->assertCreated();

    $payment = $payment->fresh();
    $subscription = $subscription->fresh();

    expect($payment->status->value)->toBe('succeeded')
        ->and($payment->paid_at)->not->toBeNull()
        ->and($subscription->status->value)->toBe('active')
        ->and($subscription->starts_at)->not->toBeNull()
        ->and($subscription->ends_at)->not->toBeNull();
});

test('admin can CRUD packages', function () {
    $admin = paymentTestAdmin();

    $this->actingAs($admin, 'admin')->postJson('/api/v1/admin/packages', [
        'name' => 'Premium',
        'description' => 'Top tier',
        'price_amount' => 150000,
        'currency' => 'MMK',
        'duration_days' => 90,
        'active_listing_limit' => 50,
        'featured_ads_limit' => 5,
        'expired_ads_action' => 'hide',
    ])->assertCreated()
        ->assertJsonPath('data.name', 'Premium')
        ->assertJsonPath('data.slug', 'premium')
        ->assertJsonPath('data.price', 150000);

    $package = Package::first();

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/packages')
        ->assertOk()
        ->assertJsonPath('data.0.id', 'package_'.$package->uuid);

    $this->actingAs($admin, 'admin')
        ->patchJson("/api/v1/admin/packages/{$package->id}", ['price_amount' => 199000])
        ->assertOk()
        ->assertJsonPath('data.price', 199000);

    $this->actingAs($admin, 'admin')
        ->postJson("/api/v1/admin/packages/{$package->id}/deactivate")
        ->assertOk()
        ->assertJsonPath('data.is_active', false);

    expect($package->fresh()->is_active)->toBeFalse();
});

test('regular user cannot access admin packages', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'admin')
        ->getJson('/api/v1/admin/packages')
        ->assertForbidden()
        ->assertJsonPath('error.code', 'PERMISSION_DENIED');
});

test('admin can search payments', function () {
    $admin = paymentTestAdmin();
    [$owner] = paymentTestShowroom();

    Payment::create([
        'payer_user_id' => $owner->id, 'provider' => 'manual',
        'provider_reference' => 'REF-AAA-111', 'amount' => 1000,
        'currency' => 'MMK', 'status' => 'pending',
    ]);
    Payment::create([
        'payer_user_id' => $owner->id, 'provider' => 'manual',
        'provider_reference' => 'REF-BBB-222', 'amount' => 2000,
        'currency' => 'MMK', 'status' => 'succeeded',
    ]);

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/payments?q=REF-AAA')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.provider_reference', 'REF-AAA-111');

    $this->actingAs($admin, 'admin')
        ->getJson('/api/v1/admin/payments?status=pending')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.provider_reference', 'REF-AAA-111');
});
