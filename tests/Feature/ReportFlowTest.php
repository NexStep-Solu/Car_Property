<?php

use App\Models\Car;
use App\Models\Notification;
use App\Models\Report;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function makeSupport(): User
{
    $support = User::factory()->create();
    $role = \Spatie\Permission\Models\Role::firstOrCreate(
        ['name' => 'support', 'guard_name' => 'admin'],
        ['name' => 'support', 'guard_name' => 'admin']
    );
    $support->roles()->attach($role->id);

    return $support;
}

test('user can report a car and handler resolution notifies them', function () {
    $reporter = User::factory()->create();
    $handler = makeSupport();

    $car = Car::create([
        'seller_user_id' => $reporter->id,
        'title' => 'Reported Car',
        'year' => 2020,
        'price_amount' => 10000,
        'currency' => 'USD',
        'location' => 'Yangon',
        'condition' => 'used',
        'status' => 'published',
    ]);

    $response = $this->actingAs($reporter)->post('/reports', [
        'target_type' => 'car',
        'target_id' => $car->id,
        'reason' => 'spam',
        'description' => 'Looks fake.',
    ]);

    $report = Report::first();
    expect($report->status->value)->toBe('open');
    $response->assertRedirect(route('reports.show', $report));

    // Stranger cannot view someone else's report
    $this->actingAs(User::factory()->create())->get("/reports/{$report->id}")->assertForbidden();

    // Handler resolves -> reporter gets notified
    $this->actingAs($handler)->post("/reports/{$report->id}/handle", [
        'status' => 'resolved',
    ])->assertRedirect();

    expect($report->fresh()->status->value)->toBe('resolved');
    expect($report->fresh()->resolved_at)->not->toBeNull();

    $notification = Notification::where('user_id', $reporter->id)->first();
    expect($notification)->not->toBeNull();
    expect($notification->read_at)->toBeNull();

    // Mark read + read all
    $this->actingAs($reporter)->post("/notifications/{$notification->id}/read")->assertRedirect();
    expect($notification->fresh()->read_at)->not->toBeNull();
});

test('audit logs are viewable by support but forbidden for plain users', function () {
    \App\Support\AuditLogger::log('test.event', null, 'testing');

    $this->actingAs(User::factory()->create())->get('/audit-logs')->assertForbidden();
    $this->actingAs(makeSupport())->get('/audit-logs')->assertOk();
});

test('device token can be registered and removed', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/device-tokens', [
        'platform' => 'android',
        'token' => 'tok-123',
    ]);
    $response->assertCreated();

    $device = \App\Models\DeviceToken::where('token', 'tok-123')->first();
    expect($device->platform->value)->toBe('android');

    $this->actingAs($user)->deleteJson("/device-tokens/{$device->id}")->assertNoContent();
    expect(\App\Models\DeviceToken::where('token', 'tok-123')->exists())->toBeFalse();
});
