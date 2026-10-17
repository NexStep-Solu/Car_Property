<?php

use App\Models\Showroom;
use App\Models\ShowroomApplication;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function makeReviewer(): User
{
    $reviewer = User::factory()->create();
    $role = \Spatie\Permission\Models\Role::firstOrCreate(
        ['name' => 'reviewer', 'guard_name' => 'admin'],
        ['name' => 'reviewer', 'guard_name' => 'admin']
    );
    $reviewer->roles()->attach($role->id);

    return $reviewer;
}

function makeShowroom(User $owner): Showroom
{
    $showroom = Showroom::create([
        'owner_user_id' => $owner->id,
        'business_name' => 'Flow Motors',
        'slug' => 'flow-motors-'.uniqid(),
        'phone' => '09222222222',
        'address' => 'Somewhere',
    ]);
    $showroom->users()->attach($owner->id, [
        'member_role' => 'owner',
        'is_active' => true,
        'joined_at' => now(),
    ]);

    return $showroom;
}

test('owner can create submit and reviewer can approve an application', function () {
    $owner = User::factory()->create();
    $reviewer = makeReviewer();
    $showroom = makeShowroom($owner);

    // Create draft
    $response = $this->actingAs($owner)->post('/applications', [
        'showroom_id' => $showroom->id,
    ]);
    $application = ShowroomApplication::first();
    expect($application->status->value)->toBe('draft');
    $response->assertRedirect(route('applications.show', $application));

    // Duplicate open application blocked
    $this->actingAs($owner)->post('/applications', [
        'showroom_id' => $showroom->id,
    ])->assertSessionHasErrors('showroom_id');

    // Submit
    $this->actingAs($owner)->post("/applications/{$application->id}/submit")->assertRedirect();
    expect($application->fresh()->status->value)->toBe('submitted');
    expect($application->fresh()->submitted_at)->not->toBeNull();

    // Reviewer approves -> showroom verified too
    $this->actingAs($reviewer)->post("/applications/{$application->id}/review", [
        'status' => 'approved',
    ])->assertRedirect();
    expect($application->fresh()->status->value)->toBe('approved');
    expect($showroom->fresh()->verification_status->value)->toBe('approved');
    expect($showroom->fresh()->approved_at)->not->toBeNull();
});

test('owner can upload and reviewer can review a document', function () {
    Storage::fake('public');
    $owner = User::factory()->create();
    $reviewer = makeReviewer();
    $showroom = makeShowroom($owner);
    $application = ShowroomApplication::create([
        'showroom_id' => $showroom->id,
        'submitted_by' => $owner->id,
        'status' => 'draft',
    ]);

    $file = UploadedFile::fake()->create('license.pdf', 100, 'application/pdf');

    $this->actingAs($owner)->post("/applications/{$application->id}/documents", [
        'document_type' => 'business_registration',
        'document' => $file,
    ])->assertRedirect();

    $document = $application->documents()->first();
    expect($document)->not->toBeNull();
    expect($document->status->value)->toBe('uploaded');
    Storage::disk('public')->assertExists($document->storage_key);

    $this->actingAs($reviewer)->post("/applications/{$application->id}/documents/{$document->id}/review", [
        'status' => 'approved',
        'review_note' => 'Looks good.',
    ])->assertRedirect();

    expect($document->fresh()->status->value)->toBe('approved');
});
