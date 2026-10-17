<?php

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('notification resource exposes the exact public shape', function () {
    $user = User::factory()->create();
    $notification = Notification::pushTo(
        $user,
        'payment.succeeded',
        'Payment received',
        'Your payment was received successfully.',
        ['payment_id' => 'payment_abc'],
    );

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/notifications')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [['id', 'type', 'title', 'body', 'data', 'is_read', 'read_at', 'created_at']],
            'meta' => ['current_page', 'per_page', 'total'],
        ])
        ->assertJsonMissing(['storage_key', 'password'])
        ->assertJsonPath('data.0.id', 'notification_'.$notification->uuid)
        ->assertJsonPath('data.0.type', 'payment.succeeded')
        ->assertJsonPath('data.0.is_read', false)
        ->assertJsonPath('data.0.data.payment_id', 'payment_abc');
});
