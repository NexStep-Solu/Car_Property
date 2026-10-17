<?php

use App\Models\Car;
use App\Models\CarCategory;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function makePublicCar(array $overrides = []): Car
{
    return Car::factory()->create(array_merge([
        'title' => 'Public Car',
        'year' => 2020,
        'price_amount' => 20000,
        'currency' => 'USD',
        'location' => 'Yangon',
        'condition' => 'used',
        'status' => 'published',
        'published_at' => now(),
    ], $overrides));
}

test('guest can list published cars', function () {
    makePublicCar();

    $this->getJson('/api/v1/cars')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.title', 'Public Car');
});

test('draft cars are hidden', function () {
    makePublicCar();
    Car::factory()->create(['status' => 'draft', 'title' => 'Hidden Draft']);

    $response = $this->getJson('/api/v1/cars')->assertOk();

    expect($response->json('meta.total'))->toBe(1);
    expect(collect($response->json('data'))->pluck('title'))->not->toContain('Hidden Draft');
});

test('filter by category_id works', function () {
    $category = CarCategory::create(['name' => 'SUV', 'slug' => 'suv']);
    makePublicCar(['category_id' => $category->id, 'title' => 'SUV Car']);
    makePublicCar(['title' => 'Other Car']);

    $response = $this->getJson("/api/v1/cars?category_id={$category->id}")->assertOk();

    expect($response->json('meta.total'))->toBe(1);
    expect($response->json('data.0.title'))->toBe('SUV Car');
});

test('filter by price range works', function () {
    makePublicCar(['price_amount' => 10000, 'title' => 'Cheap Car']);
    makePublicCar(['price_amount' => 50000, 'title' => 'Expensive Car']);

    $response = $this->getJson('/api/v1/cars?min_price=20000&max_price=60000')->assertOk();

    expect($response->json('meta.total'))->toBe(1);
    expect($response->json('data.0.title'))->toBe('Expensive Car');
});

test('sort works', function () {
    makePublicCar(['price_amount' => 10000, 'title' => 'Cheap Car']);
    makePublicCar(['price_amount' => 50000, 'title' => 'Expensive Car']);

    $asc = $this->getJson('/api/v1/cars?sort=price_asc')->assertOk();
    expect($asc->json('data.0.title'))->toBe('Cheap Car');

    $desc = $this->getJson('/api/v1/cars?sort=price_desc')->assertOk();
    expect($desc->json('data.0.title'))->toBe('Expensive Car');
});

test('pagination works', function () {
    Car::factory()->count(25)->create([
        'status' => 'published',
        'published_at' => now(),
    ]);

    $page1 = $this->getJson('/api/v1/cars?per_page=10')->assertOk();
    expect(count($page1->json('data')))->toBe(10);
    expect($page1->json('meta.total'))->toBe(25);

    $page3 = $this->getJson('/api/v1/cars?per_page=10&page=3')->assertOk();
    expect(count($page3->json('data')))->toBe(5);
});

test('per_page is capped at 100', function () {
    makePublicCar();

    $this->getJson('/api/v1/cars?per_page=500')->assertStatus(422)
        ->assertJsonPath('error.code', 'VALIDATION_ERROR');
});

test('car detail returns correct shape', function () {
    $car = makePublicCar();

    $response = $this->getJson("/api/v1/cars/{$car->uuid}")->assertOk();

    $response->assertJsonPath('data.title', 'Public Car')
        ->assertJsonPath('data.price', 20000)
        ->assertJsonPath('data.status', 'published')
        ->assertJsonStructure([
            'data' => ['id', 'title', 'make', 'model', 'year', 'price', 'currency', 'seller', 'images', 'category'],
        ]);
    expect($response->json('data.id'))->toStartWith('car_');

    // Draft detail is a 404 with the error envelope
    $draft = Car::factory()->create(['status' => 'draft']);
    $this->getJson("/api/v1/cars/{$draft->uuid}")->assertNotFound()
        ->assertJsonPath('error.code', 'RESOURCE_NOT_FOUND');
});

test('car-categories returns seeded list', function () {
    CarCategory::create(['name' => 'Sedan', 'slug' => 'sedan']);

    $response = $this->getJson('/api/v1/car-categories')->assertOk();

    expect($response->json('data.0.slug'))->toBe('sedan');
    expect($response->json('data.0.id'))->toStartWith('cat_');
});
