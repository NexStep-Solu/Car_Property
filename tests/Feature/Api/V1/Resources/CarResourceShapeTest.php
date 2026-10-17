<?php

use App\Models\Car;
use App\Models\CarCategory;
use App\Models\CarImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('car resource exposes the exact public shape', function () {
    $seller = User::factory()->create();
    $category = CarCategory::create(['name' => 'SUV', 'slug' => 'suv']);
    $car = Car::factory()->create([
        'seller_user_id' => $seller->id,
        'category_id' => $category->id,
        'title' => 'Shape Car',
        'status' => 'published',
        'published_at' => now(),
    ]);
    $image = CarImage::create([
        'car_id' => $car->id,
        'storage_key' => 'cars/one.jpg',
        'public_url' => 'https://cdn.example.com/cars/one.jpg',
        'alt_text' => 'Front view',
        'sort_order' => 0,
        'is_primary' => true,
    ]);

    $this->getJson('/api/v1/cars/'.$car->uuid)
        ->assertOk()
        ->assertJsonStructure(['data' => [
            'id', 'title', 'make', 'model', 'year', 'price', 'currency',
            'mileage', 'transmission', 'fuel_type', 'body_type', 'condition',
            'location', 'description',
            'images' => [['id', 'url', 'alt_text', 'sort_order']],
            'category' => ['id', 'name', 'slug'],
            'seller' => ['id', 'display_name', 'seller_type', 'verified'],
            'status', 'is_featured', 'published_at', 'views_count',
        ]])
        ->assertJsonMissing(['storage_key', 'password'])
        ->assertJsonPath('data.id', 'car_'.$car->uuid)
        ->assertJsonPath('data.category.id', 'cat_'.$category->uuid)
        ->assertJsonPath('data.images.0.id', 'img_'.$image->uuid)
        ->assertJsonPath('data.price', (int) $car->price_amount)
        ->assertJsonPath('data.seller.id', 'seller_'.$seller->uuid);
});
