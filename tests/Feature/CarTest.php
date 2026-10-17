<?php

use App\Models\Car;
use App\Models\Showroom;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function makeCarOwner(): array
{
    $owner = User::factory()->create();
    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Car Test Motors',
        'slug' => 'car-test-motors-'.uniqid(),
        'phone' => '09333333333',
        'address' => 'Somewhere',
    ]);
    $showroom->users()->attach($owner->id, [
        'member_role' => 'owner',
        'is_active' => true,
        'joined_at' => now(),
    ]);

    return [$owner, $showroom];
}

test('owner can list a car under their showroom and buyer cannot hijack another showroom', function () {
    [$owner, $showroom] = makeCarOwner();

    $response = $this->actingAs($owner)->post('/cars', [
        'showroom_id' => $showroom->id,
        'title' => 'Test Car',
        'year' => 2020,
        'price_amount' => 10000,
        'currency' => 'USD',
        'location' => 'Yangon',
        'condition' => 'used',
    ]);

    $car = Car::first();
    expect($car->showroom_id)->toBe($showroom->id);
    expect($car->seller_user_id)->toBeNull();
    expect($car->status->value)->toBe('draft');
    $response->assertRedirect(route('cars.show', $car));

    // Stranger cannot list under someone else's showroom
    $stranger = User::factory()->create();
    $this->actingAs($stranger)->post('/cars', [
        'showroom_id' => $showroom->id,
        'title' => 'Hijack Car',
        'year' => 2021,
        'price_amount' => 5000,
        'currency' => 'USD',
        'location' => 'Yangon',
        'condition' => 'used',
    ])->assertForbidden();

    // Neither seller nor showroom at once
    $this->actingAs($stranger)->post('/cars', [
        'seller_user_id' => $stranger->id,
        'showroom_id' => $showroom->id,
        'title' => 'Both Car',
        'year' => 2021,
        'price_amount' => 5000,
        'currency' => 'USD',
        'location' => 'Yangon',
        'condition' => 'used',
    ])->assertStatus(422);
});

test('reviewer can publish and owner can mark sold', function () {
    [$owner, $showroom] = makeCarOwner();
    $reviewer = User::factory()->create();
    $role = \Spatie\Permission\Models\Role::firstOrCreate(
        ['name' => 'reviewer', 'guard_name' => 'admin'],
        ['name' => 'reviewer', 'guard_name' => 'admin']
    );
    $reviewer->roles()->attach($role->id);

    $car = Car::create([
        'showroom_id' => $showroom->id,
        'title' => 'Flow Car',
        'year' => 2019,
        'price_amount' => 8000,
        'currency' => 'USD',
        'location' => 'Mandalay',
        'condition' => 'used',
        'status' => 'pending_review',
    ]);

    $this->actingAs($reviewer)->post("/cars/{$car->id}/status", [
        'status' => 'published',
    ])->assertRedirect();

    expect($car->fresh()->status->value)->toBe('published');
    expect($car->fresh()->published_at)->not->toBeNull();

    $this->actingAs($owner)->post("/cars/{$car->id}/status", [
        'status' => 'sold',
    ])->assertRedirect();

    expect($car->fresh()->status->value)->toBe('sold');
    expect($car->fresh()->sold_at)->not->toBeNull();

    // History recorded
    expect($car->statusHistory()->count())->toBe(2);
});

test('owner can upload an image and set it primary', function () {
    Storage::fake('public');
    [$owner, $showroom] = makeCarOwner();

    $car = Car::create([
        'showroom_id' => $showroom->id,
        'title' => 'Photo Car',
        'year' => 2022,
        'price_amount' => 15000,
        'currency' => 'USD',
        'location' => 'Yangon',
        'condition' => 'new',
        'status' => 'draft',
    ]);

    $this->actingAs($owner)->post("/cars/{$car->id}/images", [
        'image' => UploadedFile::fake()->image('car.jpg'),
    ])->assertRedirect();

    $image = $car->images()->first();
    expect($image)->not->toBeNull();
    expect((bool) $image->is_primary)->toBeTrue();
});
