<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user resource exposes the exact public shape', function () {
    $user = User::factory()->create([
        'name' => 'Shape User',
        'account_status' => 'active',
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/me')
        ->assertOk()
        ->assertJsonStructure(['data' => ['user' => [
            'id', 'name', 'display_name', 'email', 'phone', 'account_status',
            'preferred_language', 'is_admin_account', 'is_verified_seller',
            'roles', 'seller_profile', 'last_login_at', 'created_at',
        ]]])
        ->assertJsonMissing(['storage_key', 'password', 'remember_token'])
        ->assertJsonPath('data.user.id', 'user_'.$user->uuid)
        ->assertJsonPath('data.user.name', 'Shape User');
});
