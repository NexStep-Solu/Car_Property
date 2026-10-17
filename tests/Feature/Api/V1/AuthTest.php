<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('user can register', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Api User',
        'email' => 'api@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.user.email', 'api@example.com')
        ->assertJsonPath('data.user.roles.0', 'buyer');
    expect($response->json('data.token'))->not->toBeEmpty();

    $user = User::where('email', 'api@example.com')->first();
    expect($user->is_admin_account)->toBeFalse();
    expect($user->hasRole('buyer'))->toBeTrue();
});

test('user cannot register with duplicate email', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Dup User',
        'email' => 'taken@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertStatus(422)
        ->assertJsonPath('error.code', 'VALIDATION_ERROR');
});

test('user can login with email', function () {
    User::factory()->create(['email' => 'login@example.com']);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'login@example.com',
        'password' => 'password',
    ]);

    $response->assertOk()->assertJsonPath('data.user.email', 'login@example.com');
    expect($response->json('data.token'))->not->toBeEmpty();
});

test('user can login with phone', function () {
    User::factory()->create(['phone' => '09123456789']);

    $response = $this->postJson('/api/v1/auth/login', [
        'phone' => '09123456789',
        'password' => 'password',
    ]);

    $response->assertOk()->assertJsonPath('data.user.phone', '09123456789');
    expect($response->json('data.token'))->not->toBeEmpty();
});

test('suspended user cannot login', function () {
    User::factory()->create(['email' => 'suspended@example.com', 'account_status' => 'suspended']);

    $this->postJson('/api/v1/auth/login', [
        'email' => 'suspended@example.com',
        'password' => 'password',
    ])->assertForbidden()
        ->assertJsonPath('error.code', 'ACCOUNT_SUSPENDED');
});

test('authenticated user can fetch me', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/me');

    $response->assertOk()
        ->assertJsonPath('data.user.email', $user->email)
        ->assertJsonStructure(['data' => ['user' => ['id', 'roles'], 'showrooms', 'permissions']]);
    expect($response->json('data.user.id'))->toStartWith('user_');
});

test('user can logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $this->withToken($token)->postJson('/api/v1/auth/logout')->assertNoContent();

    expect($user->tokens()->count())->toBe(0);
});
