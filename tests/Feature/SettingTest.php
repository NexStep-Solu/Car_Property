<?php

use App\Models\Setting;
use App\Models\User;
use Spatie\Permission\Models\Role;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function makeSuperAdmin(): User
{
    $user = User::factory()->create();
    $role = Role::firstOrCreate(
        ['name' => 'super_admin', 'guard_name' => 'admin'],
        ['name' => 'super_admin', 'guard_name' => 'admin']
    );
    $user->roles()->attach($role->id);

    return $user;
}

test('super admin can update a setting with type coercion', function () {
    $admin = makeSuperAdmin();
    Setting::create(['key' => 'listings.max_images', 'value' => '20', 'group' => 'listings', 'type' => 'int']);

    $this->actingAs($admin)->put('/admin/settings/'.Setting::where('key', 'listings.max_images')->first()->id, [
        'value' => '30',
    ])->assertRedirect(route('admin.settings.index'));

    expect(Setting::get('listings.max_images'))->toBe(30);
});

test('non super admin cannot manage settings', function () {
    $user = User::factory()->create();
    Setting::create(['key' => 'general.site_name', 'value' => 'X', 'group' => 'general', 'type' => 'string']);

    $this->actingAs($user)->get('/admin/settings')->assertForbidden();
    $this->actingAs($user)->post('/admin/settings', [
        'key' => 'general.foo',
        'group' => 'general',
        'type' => 'string',
    ])->assertForbidden();
});

test('super admin can create and delete a setting', function () {
    $admin = makeSuperAdmin();

    $this->actingAs($admin)->post('/admin/settings', [
        'key' => 'general.site_name',
        'value' => 'Car Market',
        'group' => 'general',
        'type' => 'string',
    ])->assertRedirect(route('admin.settings.index'));

    expect(Setting::get('general.site_name'))->toBe('Car Market');

    $setting = Setting::where('key', 'general.site_name')->first();
    $this->actingAs($admin)->delete("/admin/settings/{$setting->id}")->assertRedirect(route('admin.settings.index'));
    expect(Setting::where('key', 'general.site_name')->exists())->toBeFalse();
});
