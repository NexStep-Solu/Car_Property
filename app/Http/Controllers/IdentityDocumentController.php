<?php

namespace App\Http\Controllers;

use App\Enums\IdentityDocumentStatus;
use App\Enums\IdentityDocumentType;
use App\Enums\SellerApplicationStatus;
use App\Models\IdentityDocument;
use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class IdentityDocumentController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected function canReview(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'reviewer'], 'admin');
    }

    protected function isPlatformAdmin(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'reviewer', 'support'], 'admin');
    }

    protected function canManage(User $user, SellerApplication $application): bool
    {
        return $application->user_id === $user->id
            || $user->hasRole('super_admin', 'admin');
    }

    protected function canSee(User $user, SellerApplication $application): bool
    {
        return $this->canManage($user, $application) || $this->isPlatformAdmin($user);
    }

    public function store(Request $request, SellerApplication $application)
    {
        if (! $this->canManage($request->user(), $application)) {
            abort(403, 'You do not have permission to upload documents.');
        }

        if (in_array($application->status, [SellerApplicationStatus::Approved, SellerApplicationStatus::Rejected], true)) {
            abort(422, 'Documents cannot be added to a decided application.');
        }

        $validated = $request->validate([
            'document_type' => ['required', Rule::in(array_column(IdentityDocumentType::cases(), 'value'))],
            'document' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,webp',
        ]);

        $file = $request->file('document');

        IdentityDocument::create([
            'seller_application_id' => $application->id,
            'document_type' => $validated['document_type'],
            'storage_key' => $file->store('identity-documents', 'public'),
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size_bytes' => $file->getSize(),
            'document_status' => IdentityDocumentStatus::Uploaded->value,
        ]);

        return redirect()->route('seller-applications.show', $application)->with('success', 'Document uploaded successfully.');
    }

    public function destroy(Request $request, SellerApplication $application, IdentityDocument $document)
    {
        $this->ensureBelongs($application, $document);

        if (! $this->canManage($request->user(), $application)) {
            abort(403, 'You do not have permission to delete documents.');
        }

        if ($document->document_status !== IdentityDocumentStatus::Uploaded
            && ! $request->user()->hasRole('super_admin', 'admin')) {
            abort(403, 'Only unreviewed documents can be deleted.');
        }

        Storage::disk('public')->delete($document->storage_key);
        $document->delete();

        return redirect()->route('seller-applications.show', $application)->with('success', 'Document deleted successfully.');
    }

    /**
     * Reviewer decision on a single document.
     */
    public function review(Request $request, SellerApplication $application, IdentityDocument $document)
    {
        $this->ensureBelongs($application, $document);

        if (! $this->canReview($request->user())) {
            abort(403, 'You do not have permission to review documents.');
        }

        $validated = $request->validate([
            'document_status' => ['required', Rule::in([
                IdentityDocumentStatus::Accepted->value,
                IdentityDocumentStatus::Rejected->value,
                IdentityDocumentStatus::ReplacementRequested->value,
            ])],
            'review_note' => 'nullable|string',
        ]);

        $document->update([
            'document_status' => $validated['document_status'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_note' => $validated['review_note'] ?? null,
        ]);

        return redirect()->route('seller-applications.show', $application)->with('success', 'Document review recorded.');
    }

    public function download(Request $request, SellerApplication $application, IdentityDocument $document)
    {
        $this->ensureBelongs($application, $document);

        if (! $this->canSee($request->user(), $application)) {
            abort(403, 'You do not have permission to download this document.');
        }

        if (! Storage::disk('public')->exists($document->storage_key)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($document->storage_key, $document->original_filename);
    }

    protected function ensureBelongs(SellerApplication $application, IdentityDocument $document): void
    {
        if ($document->seller_application_id !== $application->id) {
            abort(404);
        }
    }
}
