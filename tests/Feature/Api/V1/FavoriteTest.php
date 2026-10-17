<?php

use App\Models\Car;
use App\Models\Favorite;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function favoriteCar(array $overrides = []): Car
{
    return Car::create(array_merge([
        'title' => 'Favorite Car',
        'year' => 2021,
        'price_amount' => 5000,
        'currency' => 'USD',
        'location' => 'Yangon',
        'condition' => 'used',
        'status' => 'published',
    ], $overrides));
}

test('user can favorite a car', function () {
    $user = User::factory()->create();
    $car = favoriteCar();

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/me/favorites/{$car->uuid}")
        ->assertCreated()
        ->assertJsonPath('data.id', 'car_'.$car->uuid);

    expect(Favorite::where('user_id', $user->id)->where('car_id', $car->id)->count())->toBe(1);
});

test('duplicate favorite is idempotent', function () {
    $user = User::factory()->create();
    $car = favoriteCar();

    $this->actingAs($user, 'sanctum');

    $this->postJson("/api/v1/me/favorites/{$car->uuid}")->assertCreated();
    $this->postJson("/api/v1/me/favorites/{$car->uuid}")->assertOk();

    expect(Favorite::where('user_id', $user->id)->where('car_id', $car->id)->count())->toBe(1);
});

test('favorites index lists only own favorites', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $carA = favoriteCar();
    $carB = favoriteCar();
    $carC = favoriteCar();

    Favorite::create(['user_id' => $user->id, 'car_id' => $carA->id]);
    Favorite::create(['user_id' => $user->id, 'car_id' => $carB->id]);
    Favorite::create(['user_id' => $other->id, 'car_id' => $carC->id]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/me/favorites')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', 'car_'.$carB->uuid)
        ->assertJsonPath('data.1.id', 'car_'.$carA->uuid);
});

test('user can remove a favorite', function () {
    $user = User::factory()->create();
    $car = favoriteCar();
    Favorite::create(['user_id' => $user->id, 'car_id' => $car->id]);

    $this->actingAs($user, 'sanctum')
        ->deleteJson("/api/v1/me/favorites/{$car->uuid}")
        ->assertNoContent();

    expect(Favorite::where('user_id', $user->id)->where('car_id', $car->id)->count())->toBe(0);
});
