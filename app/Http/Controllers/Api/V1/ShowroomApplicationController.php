<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ShowroomApplicationStatus;
use App\Enums\ShowroomDocumentStatus;
use App\Enums\ShowroomVerificationStatus;
use App\Http\Requests\Api\V1\Showroom\StoreShowroomApplicationRequest;
use App\Http\Requests\Api\V1\Showroom\UploadShowroomDocumentRequest;
use App\Http\Resources\ShowroomApplicationResource;
use App\Http\Resources\ShowroomDocumentResource;
use App\Models\Showroom;
use App\Models\ShowroomApplication;
use App\Models\ShowroomDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ShowroomApplicationController extends BaseApiController
{
    /**
     * Showrooms the user owns or actively manages.
     */
    protected function manageableShowrooms(Request $request)
    {
        $user = $request->user();

        return Showroom::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
                ->orWhereHas('users', fn ($q) => $q->where('users.id', $user->id)->wherePivot('is_active', true));
        });
    }

    protected function ownApplication(Request $request): ShowroomApplication
    {
        return ShowroomApplication::whereIn('showroom_id', $this->manageableShowrooms($request)->pluck('id'))
            ->latest('id')
            ->firstOrFail();
    }

    /**
     * Register a showroom (pending) together with its draft application.
     */
    public function store(StoreShowroomApplicationRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $showroom = Showroom::create([
            ...$validated,
            'slug' => $this->uniqueSlug($validated['business_name']),
            'owner_user_id' => $request->user()->id,
            'verification_status' => ShowroomVerificationStatus::Pending->value,
        ]);

        $showroom->users()->attach($request->user()->id, [
            'member_role' => 'owner',
            'is_active' => true,
            'joined_at' => now(),
        ]);

        $application = ShowroomApplication::create([
            'showroom_id' => $showroom->id,
            'submitted_by' => $request->user()->id,
            'status' => ShowroomApplicationStatus::Draft->value,
        ]);

        return $this->created(new ShowroomApplicationResource($application->load(['documents', 'showroom'])));
    }

    public function me(Request $request): JsonResponse
    {
        $application = $this->ownApplication($request);

        return $this->ok(new ShowroomApplicationResource($application->load(['documents', 'showroom'])));
    }

    public function update(Request $request): JsonResponse
    {
        $application = $this->ownApplication($request);

        if (! in_array($application->status, [ShowroomApplicationStatus::Draft, ShowroomApplicationStatus::ChangesRequested], true)) {
            return $this->error('APPLICATION_LOCKED', 'Only draft applications can be updated.', 422);
        }

        // Applications carry no editable fields besides status flow;
        // showroom profile edits go through the showroom endpoints.
        return $this->ok(new ShowroomApplicationResource($application->load(['documents', 'showroom'])));
    }

    public function uploadDocument(UploadShowroomDocumentRequest $request): JsonResponse
    {
        $application = $this->ownApplication($request);

        if (in_array($application->status, [ShowroomApplicationStatus::Approved, ShowroomApplicationStatus::Rejected], true)) {
            return $this->error('APPLICATION_LOCKED', 'Documents cannot be added to a decided application.', 422);
        }

        $validated = $request->validated();
        $file = $request->file('file');

        $document = ShowroomDocument::create([
            'showroom_application_id' => $application->id,
            'document_type' => $validated['document_type'],
            'storage_key' => $file->store('showroom-documents', 'local'),
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size_bytes' => $file->getSize(),
            'status' => ShowroomDocumentStatus::Uploaded->value,
        ]);

        return $this->created(new ShowroomDocumentResource($document));
    }

    public function submit(Request $request): JsonResponse
    {
        $application = $this->ownApplication($request);

        if (! in_array($application->status, [ShowroomApplicationStatus::Draft, ShowroomApplicationStatus::ChangesRequested], true)) {
            return $this->error('APPLICATION_LOCKED', 'Only draft applications can be submitted.', 422);
        }

        if ($application->documents()->count() === 0) {
            return $this->error('DOCUMENT_REQUIRED', 'Upload at least one document first.', 422);
        }

        $application->update([
            'status' => ShowroomApplicationStatus::Submitted->value,
            'submitted_at' => now(),
            'reviewed_by' => null,
            'reviewed_at' => null,
            'review_reason' => null,
        ]);

        return $this->ok(new ShowroomApplicationResource($application->fresh()->load(['documents', 'showroom'])));
    }

    protected function uniqueSlug(string $businessName): string
    {
        $base = Str::slug($businessName) ?: 'showroom';
        $candidate = $base;
        $i = 2;

        while (Showroom::where('slug', $candidate)->exists()) {
            $candidate = "{$base}-{$i}";
            $i++;
        }

        return $candidate;
    }
}
