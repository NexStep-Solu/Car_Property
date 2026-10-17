<?php

use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);



function sellerApiPayload(): array
{
    return [
        'seller_type' => 'individual',
        'full_name' => 'Api Seller',
        'phone' => '09123456789',
        'address' => 'Yangon',
        'accepted_terms' => true,
    ];
}

test('user can create application', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/seller-applications', sellerApiPayload());

    $response->assertCreated()->assertJsonPath('data.status', 'draft');
    expect(SellerApplication::where('user_id', $user->id)->count())->toBe(1);
});

test('cannot create without accepted_terms', function () {
    $user = User::factory()->create();

    $payload = sellerApiPayload();
    $payload['accepted_terms'] = false;

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/seller-applications', $payload)
        ->assertStatus(422)
        ->assertJsonPath('error.code', 'VALIDATION_ERROR');
});

test('cannot submit without document', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/seller-applications', sellerApiPayload())->assertCreated();

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/seller-applications/me/submit')
        ->assertStatus(422)
        ->assertJsonPath('error.code', 'DOCUMENT_REQUIRED');
});

test('cannot update others application', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $this->actingAs($userA, 'sanctum')->postJson('/api/v1/seller-applications', sellerApiPayload())->assertCreated();

    // B has no application of their own -> 404, never A's data.
    $this->actingAs($userB, 'sanctum')->patchJson('/api/v1/seller-applications/me', [
        'full_name' => 'Hijacked',
    ])->assertNotFound()
        ->assertJsonPath('error.code', 'RESOURCE_NOT_FOUND');

    expect(SellerApplication::where('full_name', 'Hijacked')->exists())->toBeFalse();
});

test('document uploads to private disk', function () {
    Storage::fake('local');
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/seller-applications', sellerApiPayload())->assertCreated();

    $response = $this->actingAs($user, 'sanctum')->post('/api/v1/seller-applications/me/documents', [
        'document_type' => 'nrc',
        'file' => UploadedFile::fake()->create('nrc.pdf', 100, 'application/pdf'),
    ]);

    $response->assertCreated()->assertJsonMissingPath('data.storage_key');

    $document = \App\Models\IdentityDocument::first();
    Storage::disk('local')->assertExists($document->storage_key);
    expect($document->storage_key)->not->toContain('public');

    // Submit now succeeds with a document attached.
    $this->actingAs($user, 'sanctum')->postJson('/api/v1/seller-applications/me/submit')->assertOk();
});

test('user cannot download others documents', function () {
    Storage::fake('local');
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $this->actingAs($userA, 'sanctum')->postJson('/api/v1/seller-applications', sellerApiPayload())->assertCreated();
    $this->actingAs($userA, 'sanctum')->post('/api/v1/seller-applications/me/documents', [
        'document_type' => 'nrc',
        'file' => UploadedFile::fake()->create('nrc.pdf', 100, 'application/pdf'),
    ])->assertCreated();

    $document = \App\Models\IdentityDocument::first();

    // B has no application -> 404, never A's file.
    $this->actingAs($userB, 'sanctum')->get("/api/v1/seller-applications/me/documents/{$document->id}")
        ->assertNotFound()
        ->assertJsonPath('error.code', 'RESOURCE_NOT_FOUND');
});
