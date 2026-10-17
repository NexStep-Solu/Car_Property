<?php

use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('purchase inquiry resource exposes the exact public shape', function () {
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $car = Car::create([
        'seller_user_id' => $seller->id,
        'title' => 'Inquiry Shape Car',
        'year' => 2020,
        'price_amount' => 12000,
        'currency' => 'USD',
        'location' => 'Yangon',
        'condition' => 'used',
        'status' => 'published',
    ]);

    $response = $this->actingAs($buyer, 'sanctum')->postJson('/api/v1/purchase-inquiries', [
        'car_id' => $car->uuid,
        'message' => 'Is this still available?',
        'preferred_contact_method' => 'phone',
        'contact_phone' => '09123456789',
    ])->assertCreated();

    $inquiryId = $response->json('data.id');

    $this->actingAs($buyer, 'sanctum')
        ->getJson('/api/v1/me/purchase-inquiries')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [[
                'id', 'message', 'contact_phone', 'contact_method', 'status',
                'car' => ['id', 'title', 'price', 'currency', 'status', 'seller' => ['id', 'display_name', 'seller_type', 'verified']],
                'sender' => ['id', 'name', 'display_name', 'email', 'phone', 'account_status', 'is_admin_account', 'is_verified_seller', 'created_at'],
                'created_at', 'updated_at',
            ]],
            'meta' => ['current_page', 'per_page', 'total'],
        ])
        ->assertJsonMissing(['storage_key', 'password'])
        ->assertJsonPath('data.0.id', $inquiryId)
        ->assertJsonPath('data.0.contact_method', 'phone')
        ->assertJsonPath('data.0.car.id', 'car_'.$car->uuid)
        ->assertJsonPath('data.0.sender.id', 'user_'.$buyer->uuid);
});
