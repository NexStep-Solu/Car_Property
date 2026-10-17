<?php

use App\Models\Car;
use App\Models\CarCategory;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('categories can be managed and assigned to cars', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/categories', [
        'name' => 'Sedan',
    ])->assertRedirect(route('catalogue.index'));

    $category = CarCategory::where('slug', 'sedan')->first();
    expect($category)->not->toBeNull();

    $car = Car::factory()->create(['seller_user_id' => $user->id]);
    $this->actingAs($user)->put("/cars/{$car->id}", [
        'category_id' => $category->id,
        'title' => $car->title,
        'year' => $car->year,
        'price_amount' => $car->price_amount,
        'currency' => $car->currency,
        'location' => $car->location,
        'condition' => 'used',
    ])->assertRedirect();

    // Category with cars cannot be deleted
    $this->actingAs($user)->delete("/categories/{$category->slug}")->assertSessionHasErrors();

    expect($car->fresh()->category->name)->toBe('Sedan');
});

test('webhook events index is super admin only', function () {
    $this->actingAs(User::factory()->create())->get('/webhooks')->assertForbidden();

    $admin = User::factory()->create();
    $role = \Spatie\Permission\Models\Role::firstOrCreate(
        ['name' => 'super_admin', 'guard_name' => 'admin'],
        ['name' => 'super_admin', 'guard_name' => 'admin']
    );
    $admin->roles()->attach($role->id);

    \App\Models\PaymentWebhookEvent::create([
        'provider' => 'manual',
        'event_id' => 'evt-1',
        'event_type' => 'payment.succeeded',
        'payload_safe' => ['ok' => true],
    ]);

    $this->actingAs($admin)->get('/webhooks')->assertOk();
});
