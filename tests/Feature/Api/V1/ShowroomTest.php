<?php

use App\Models\Showroom;
use App\Models\ShowroomApplication;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('owner can register showroom with application and submit it', function () {
    $owner = User::factory()->create();

    $response = $this->actingAs($owner, 'sanctum')->postJson('/api/v1/showroom-applications', [
        'business_name' => 'API Motors',
        'phone' => '09123456789',
        'address' => 'Yangon',
    ]);

    $response->assertCreated()->assertJsonPath('data.status', 'draft');

    $showroom = Showroom::where('slug', 'api-motors')->first();
    expect($showroom->owner_user_id)->toBe($owner->id);
    expect($showroom->verification_status->value)->toBe('pending');

    // Me endpoints resolve the owner's application
    $this->actingAs($owner, 'sanctum')->getJson('/api/v1/showroom-applications/me')
        ->assertOk()->assertJsonPath('data.status', 'draft');

    // Submit blocked without documents
    $this->actingAs($owner, 'sanctum')->postJson('/api/v1/showroom-applications/me/submit')
        ->assertStatus(422)->assertJsonPath('error.code', 'DOCUMENT_REQUIRED');

    Storage::fake('local');
    $this->actingAs($owner, 'sanctum')->post('/api/v1/showroom-applications/me/documents', [
        'document_type' => 'business_registration',
        'file' => UploadedFile::fake()->create('br.pdf', 100, 'application/pdf'),
    ])->assertCreated();

    $this->actingAs($owner, 'sanctum')->postJson('/api/v1/showroom-applications/me/submit')->assertOk();

    $application = ShowroomApplication::first();
    expect($application->status->value)->toBe('submitted');
});

test('public showroom profile visible only when approved', function () {
    $owner = User::factory()->create();
    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Hidden Motors',
        'slug' => 'hidden-motors',
        'phone' => '09000000000',
        'address' => 'X',
        'verification_status' => 'pending',
    ]);

    $this->getJson("/api/v1/showrooms/{$showroom->slug}")->assertNotFound();

    $showroom->update(['verification_status' => 'approved']);

    $this->getJson("/api/v1/showrooms/{$showroom->slug}")->assertOk()
        ->assertJsonPath('data.business_name', 'Hidden Motors')
        ->assertJsonPath('data.verification_status', 'approved');
});

test('owner can update own showroom but stranger cannot', function () {
    $owner = User::factory()->create();
    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Edit Motors',
        'slug' => 'edit-motors',
        'phone' => '09111111111',
        'address' => 'X',
    ]);

    $this->actingAs($owner, 'sanctum')->patchJson('/api/v1/me/showroom', [
        'phone' => '09222222222',
    ])->assertOk()->assertJsonPath('data.phone', '09222222222');

    $stranger = User::factory()->create();
    $this->actingAs($stranger, 'sanctum')->patchJson('/api/v1/me/showroom', [
        'phone' => '09333333333',
    ])->assertNotFound();
});
