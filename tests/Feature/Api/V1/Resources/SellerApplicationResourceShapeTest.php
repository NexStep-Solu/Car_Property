<?php

use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('seller application resource exposes the exact public shape', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/seller-applications', [
        'seller_type' => 'individual',
        'full_name' => 'Shape Seller',
        'phone' => '09123456789',
        'address' => 'Yangon',
        'accepted_terms' => true,
    ])->assertCreated();

    $application = SellerApplication::where('user_id', $user->id)->firstOrFail();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/seller-applications/me')
        ->assertOk()
        ->assertJsonStructure(['data' => [
            'id', 'seller_type', 'full_name', 'phone', 'email', 'address',
            'accepted_terms', 'accepted_terms_at', 'status', 'submitted_at',
            'reviewed_at', 'review_reason', 'documents',
        ]])
        ->assertJsonMissing(['storage_key', 'password'])
        ->assertJsonPath('data.id', 'seller_app_'.$application->uuid)
        ->assertJsonPath('data.status', 'draft')
        ->assertJsonPath('data.seller_type', 'individual');
});
