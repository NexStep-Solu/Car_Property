<?php

use App\Models\Showroom;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('showroom resource exposes the exact public shape', function () {
    $owner = User::factory()->create();
    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Shape Motors',
        'slug' => 'shape-motors',
        'phone' => '09999999999',
        'address' => 'Yangon',
        'description' => 'A showroom.',
    ]);

    $this->actingAs($owner, 'sanctum')
        ->getJson('/api/v1/me/showroom')
        ->assertOk()
        ->assertJsonStructure(['data' => [
            'id', 'business_name', 'slug', 'phone', 'email', 'address',
            'region', 'logo_url', 'verification_status', 'approved_at',
            'description',
        ]])
        ->assertJsonMissing(['storage_key', 'password'])
        ->assertJsonPath('data.id', 'showroom_'.$showroom->uuid)
        ->assertJsonPath('data.business_name', 'Shape Motors')
        ->assertJsonPath('data.verification_status', 'pending');
});
