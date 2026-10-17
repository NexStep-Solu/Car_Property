<?php

use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function makeSellerReviewer(): User
{
    $reviewer = User::factory()->create();
    $role = \Spatie\Permission\Models\Role::firstOrCreate(
        ['name' => 'reviewer', 'guard_name' => 'admin'],
        ['name' => 'reviewer', 'guard_name' => 'admin']
    );
    $reviewer->roles()->attach($role->id);

    return $reviewer;
}

test('applicant can apply submit and reviewer approval creates profile and role', function () {
    $applicant = User::factory()->create();
    $reviewer = makeSellerReviewer();

    $response = $this->actingAs($applicant)->post('/seller-applications', [
        'seller_type' => 'individual',
        'full_name' => 'Test Seller',
        'phone' => '09123456789',
    ]);

    $application = SellerApplication::first();
    expect($application->status->value)->toBe('draft');
    $response->assertRedirect(route('seller-applications.show', $application));

    $this->actingAs($applicant)->post("/seller-applications/{$application->id}/submit")->assertRedirect();
    expect($application->fresh()->status->value)->toBe('pending_review');

    $this->actingAs($reviewer)->post("/seller-applications/{$application->id}/review", [
        'status' => 'approved',
    ])->assertRedirect();

    expect($application->fresh()->status->value)->toBe('approved');

    $profile = \App\Models\SellerProfile::where('user_id', $applicant->id)->first();
    expect($profile)->not->toBeNull();
    expect($profile->verification_status->value)->toBe('approved');
    expect($applicant->fresh()->hasRole('individual_seller'))->toBeTrue();
});

test('applicant can upload NRC and reviewer can accept it', function () {
    Storage::fake('public');
    $applicant = User::factory()->create();
    $reviewer = makeSellerReviewer();

    $application = SellerApplication::create([
        'user_id' => $applicant->id,
        'seller_type' => 'individual',
        'full_name' => 'Doc Seller',
        'phone' => '09222222222',
        'status' => 'draft',
    ]);

    $this->actingAs($applicant)->post("/seller-applications/{$application->id}/documents", [
        'document_type' => 'nrc',
        'document' => UploadedFile::fake()->create('nrc.pdf', 100, 'application/pdf'),
    ])->assertRedirect();

    $document = $application->documents()->first();
    expect($document)->not->toBeNull();
    expect($document->document_status->value)->toBe('uploaded');

    $this->actingAs($reviewer)->post("/seller-applications/{$application->id}/documents/{$document->id}/review", [
        'document_status' => 'accepted',
    ])->assertRedirect();

    expect($document->fresh()->document_status->value)->toBe('accepted');
});
