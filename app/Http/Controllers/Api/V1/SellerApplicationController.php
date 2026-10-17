<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\IdentityDocumentStatus;
use App\Enums\SellerApplicationStatus;
use App\Http\Requests\Api\V1\Seller\StoreSellerApplicationRequest;
use App\Http\Requests\Api\V1\Seller\UpdateSellerApplicationRequest;
use App\Http\Requests\Api\V1\Seller\UploadDocumentRequest;
use App\Http\Resources\IdentityDocumentResource;
use App\Http\Resources\SellerApplicationResource;
use App\Models\IdentityDocument;
use App\Models\SellerApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SellerApplicationController extends BaseApiController
{
    protected function ownApplication(Request $request): SellerApplication
    {
        return SellerApplication::where('user_id', $request->user()->id)
            ->latest('id')
            ->firstOrFail();
    }

    public function store(StoreSellerApplicationRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $openExists = SellerApplication::where('user_id', $request->user()->id)
            ->whereIn('status', [
                SellerApplicationStatus::Draft->value,
                SellerApplicationStatus::PendingReview->value,
                SellerApplicationStatus::ChangesRequested->value,
            ])
            ->exists();

        if ($openExists) {
            return $this->error('APPLICATION_EXISTS', 'You already have an open application.', 422);
        }

        $application = SellerApplication::create([
            ...$validated,
            'accepted_terms_at' => now(),
            'user_id' => $request->user()->id,
            'status' => SellerApplicationStatus::Draft->value,
        ]);

        return $this->created(new SellerApplicationResource($application->load('documents')));
    }

    public function me(Request $request): JsonResponse
    {
        $application = $this->ownApplication($request);

        return $this->ok(new SellerApplicationResource($application->load('documents')));
    }

    public function update(UpdateSellerApplicationRequest $request): JsonResponse
    {
        $application = $this->ownApplication($request);

        if (! in_array($application->status, [SellerApplicationStatus::Draft, SellerApplicationStatus::ChangesRequested], true)) {
            return $this->error('APPLICATION_LOCKED', 'Only draft applications can be updated.', 422);
        }

        $application->update($request->validated());

        return $this->ok(new SellerApplicationResource($application->fresh()->load('documents')));
    }

    public function uploadDocument(UploadDocumentRequest $request): JsonResponse
    {
        $application = $this->ownApplication($request);

        if (in_array($application->status, [SellerApplicationStatus::Approved, SellerApplicationStatus::Rejected], true)) {
            return $this->error('APPLICATION_LOCKED', 'Documents cannot be added to a decided application.', 422);
        }

        $validated = $request->validated();
        $file = $request->file('file');

        $document = IdentityDocument::create([
            'seller_application_id' => $application->id,
            'document_type' => $validated['document_type'],
            'storage_key' => $file->store('identity-documents', 'local'),
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size_bytes' => $file->getSize(),
            'document_status' => IdentityDocumentStatus::Uploaded->value,
        ]);

        return $this->created(new IdentityDocumentResource($document));
    }

    public function downloadDocument(Request $request, IdentityDocument $document): JsonResponse|\Symfony\Component\HttpFoundation\StreamedResponse
    {
        $application = $this->ownApplication($request);
        $this->ensureBelongs($application, $document);

        if (! Storage::disk('local')->exists($document->storage_key)) {
            abort(404);
        }

        return Storage::disk('local')->download($document->storage_key, $document->original_filename);
    }

    public function deleteDocument(Request $request, IdentityDocument $document): JsonResponse
    {
        $application = $this->ownApplication($request);
        $this->ensureBelongs($application, $document);

        if ($document->document_status !== IdentityDocumentStatus::Uploaded) {
            return $this->error('DOCUMENT_LOCKED', 'Only unreviewed documents can be deleted.', 422);
        }

        Storage::disk('local')->delete($document->storage_key);
        $document->delete();

        return $this->noContent();
    }

    public function submit(Request $request): JsonResponse
    {
        $application = $this->ownApplication($request);

        if (! in_array($application->status, [SellerApplicationStatus::Draft, SellerApplicationStatus::ChangesRequested], true)) {
            return $this->error('APPLICATION_LOCKED', 'Only draft applications can be submitted.', 422);
        }

        if (! $application->accepted_terms) {
            return $this->error('TERMS_NOT_ACCEPTED', 'You must accept the terms first.', 422);
        }

        if ($application->documents()->count() === 0) {
            return $this->error('DOCUMENT_REQUIRED', 'Upload at least one identity document first.', 422);
        }

        $application->update([
            'status' => SellerApplicationStatus::PendingReview->value,
            'submitted_at' => now(),
            'reviewed_by' => null,
            'reviewed_at' => null,
            'review_reason' => null,
        ]);

        return $this->ok(new SellerApplicationResource($application->fresh()->load('documents')));
    }

    protected function ensureBelongs(SellerApplication $application, IdentityDocument $document): void
    {
        if ($document->seller_application_id !== $application->id) {
            abort(404);
        }
    }
}
