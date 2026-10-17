<?php

use App\Models\Car;
use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function inquirySeller(): User
{
    $permission = Permission::firstOrCreate(
        ['name' => 'manage own listings', 'guard_name' => 'web'],
        ['name' => 'manage own listings', 'guard_name' => 'web']
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

function inquiryCar(User $seller, array $overrides = []): Car
{
    return Car::create(array_merge([
        'seller_user_id' => $seller->id,
        'title' => 'Inquiry Car',
        'year' => 2020,
        'price_amount' => 12000,
        'currency' => 'USD',
        'location' => 'Yangon',
        'condition' => 'used',
        'status' => 'published',
    ], $overrides));
}

test('user can send inquiry on a published car', function () {
    $seller = inquirySeller();
    $buyer = User::factory()->create();
    $car = inquiryCar($seller);

    $this->actingAs($buyer, 'sanctum')->postJson('/api/v1/purchase-inquiries', [
        'car_id' => $car->uuid,
        'message' => 'Is this still available?',
        'preferred_contact_method' => 'phone',
        'contact_phone' => '09123456789',
    ])->assertCreated()
        ->assertJsonPath('data.status', 'new')
        ->assertJsonPath('data.car.id', 'car_'.$car->uuid);

    $inquiry = Inquiry::first();
    expect($inquiry->sender_user_id)->toBe($buyer->id)
        ->and($inquiry->receiver_user_id)->toBe($seller->id)
        ->and($inquiry->car_id)->toBe($car->id);
});

test('guest cannot send inquiry', function () {
    $seller = inquirySeller();
    $car = inquiryCar($seller);

    $this->postJson('/api/v1/purchase-inquiries', [
        'car_id' => $car->uuid,
        'message' => 'Hello?',
    ])->assertUnauthorized()
        ->assertJsonPath('error.code', 'AUTHENTICATION_REQUIRED');
});

test('inquiry on unpublished car is rejected', function () {
    $seller = inquirySeller();
    $buyer = User::factory()->create();
    $car = inquiryCar($seller, ['status' => 'draft']);

    $this->actingAs($buyer, 'sanctum')->postJson('/api/v1/purchase-inquiries', [
        'car_id' => $car->uuid,
        'message' => 'Trying anyway',
    ])->assertUnprocessable()
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonPath('error.errors.car_id.0', 'This car is not available for inquiries.');

    expect(Inquiry::count())->toBe(0);
});

test('seller sees only own inquiries', function () {
    $sellerA = inquirySeller();
    $sellerB = inquirySeller();
    $buyer = User::factory()->create();
    $carA = inquiryCar($sellerA);
    $carB = inquiryCar($sellerB);

    Inquiry::create([
        'car_id' => $carA->id, 'sender_user_id' => $buyer->id,
        'receiver_user_id' => $sellerA->id, 'message' => 'Mine',
    ]);
    Inquiry::create([
        'car_id' => $carB->id, 'sender_user_id' => $buyer->id,
        'receiver_user_id' => $sellerB->id, 'message' => 'Not mine',
    ]);

    $this->actingAs($sellerA, 'sanctum')
        ->getJson('/api/v1/seller/inquiries')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.car.id', 'car_'.$carA->uuid)
        ->assertJsonPath('data.0.message', 'Mine');
});

test('seller can update inquiry status', function () {
    $seller = inquirySeller();
    $buyer = User::factory()->create();
    $car = inquiryCar($seller);
    $inquiry = Inquiry::create([
        'car_id' => $car->id, 'sender_user_id' => $buyer->id,
        'receiver_user_id' => $seller->id, 'message' => 'Ping',
    ]);

    $this->actingAs($seller, 'sanctum')
        ->patchJson("/api/v1/seller/inquiries/{$inquiry->uuid}", ['status' => 'contacted'])
        ->assertOk()
        ->assertJsonPath('data.status', 'contacted');

    expect($inquiry->fresh()->status->value)->toBe('contacted');
});

test('stranger cannot view seller inquiry', function () {
    $seller = inquirySeller();
    $stranger = User::factory()->create();
    $buyer = User::factory()->create();
    $car = inquiryCar($seller);
    $inquiry = Inquiry::create([
        'car_id' => $car->id, 'sender_user_id' => $buyer->id,
        'receiver_user_id' => $seller->id, 'message' => 'Private',
    ]);

    $this->actingAs($stranger, 'sanctum')
        ->getJson("/api/v1/seller/inquiries/{$inquiry->uuid}")
        ->assertNotFound();
});

test('inquiry endpoint is rate limited', function () {
    $seller = inquirySeller();
    $buyer = User::factory()->create();
    $car = inquiryCar($seller);

    $this->actingAs($buyer, 'sanctum');

    for ($i = 0; $i < 20; $i++) {
        $this->postJson('/api/v1/purchase-inquiries', [
            'car_id' => $car->uuid,
            'message' => "Inquiry {$i}",
        ])->assertCreated();
    }

    $this->postJson('/api/v1/purchase-inquiries', [
        'car_id' => $car->uuid,
        'message' => 'One too many',
    ])->assertStatus(429)
        ->assertJsonPath('error.code', 'RATE_LIMIT_EXCEEDED');

    expect(Inquiry::count())->toBe(20);
});
