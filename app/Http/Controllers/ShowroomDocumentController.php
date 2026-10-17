<?php

namespace App\Http\Controllers;

use App\Enums\ShowroomApplicationStatus;
use App\Enums\ShowroomDocumentStatus;
use App\Enums\ShowroomDocumentType;
use App\Models\Showroom;
use App\Models\ShowroomApplication;
use App\Models\ShowroomDocument;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ShowroomDocumentController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected function isPlatformAdmin(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'reviewer', 'support'], 'admin');
    }

    protected function canReview(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'reviewer'], 'admin');
    }

    protected function isOwner(User $user, Showroom $showroom): bool
    {
        return $showroom->owner_user_id === $user->id;
    }

    protected function activeMemberRole(User $user, Showroom $showroom): ?string
    {
        $member = $showroom->users()
            ->wherePivot('is_active', true)
            ->where('users.id', $user->id)
            ->first();

        return $member?->pivot->member_role;
    }

    protected function canManage(User $user, Showroom $showroom): bool
    {
        if ($this->isPlatformAdmin($user) || $this->isOwner($user, $showroom)) {
            return true;
        }

        return in_array($this->activeMemberRole($user, $showroom), ['owner', 'manager'], true);
    }

    protected function canSee(User $user, ShowroomApplication $application): bool
    {
        return $this->canManage($user, $application->showroom) || $this->isPlatformAdmin($user);
    }

    public function store(Request $request, ShowroomApplication $application)
    {
        if (! $this->canManage($request->user(), $application->showroom)) {
            abort(403, 'You do not have permission to upload documents.');
        }

        if (in_array($application->status, [ShowroomApplicationStatus::Approved, ShowroomApplicationStatus::Rejected], true)) {
            abort(422, 'Documents cannot be added to a decided application.');
        }

        $validated = $request->validate([
            'document_type' => ['required', Rule::in(array_column(ShowroomDocumentType::cases(), 'value'))],
            'document' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,webp',
        ]);

        $file = $request->file('document');
        $path = $file->store('showroom-documents', 'public');

        $document = ShowroomDocument::create([
            'showroom_application_id' => $application->id,
            'document_type' => $validated['document_type'],
            'storage_key' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size_bytes' => $file->getSize(),
            'status' => ShowroomDocumentStatus::Uploaded->value,
        ]);

        return redirect()->route('applications.show', $application)->with('success', 'Document uploaded successfully.');
    }

    public function destroy(Request $request, ShowroomApplication $application, ShowroomDocument $document)
    {
        $this->ensureBelongs($application, $document);

        if (! $this->canManage($request->user(), $application->showroom)) {
            abort(403, 'You do not have permission to delete documents.');
        }

        if ($document->status !== ShowroomDocumentStatus::Uploaded
            && ! $request->user()->hasRole('super_admin', 'admin')) {
            abort(403, 'Only unreviewed documents can be deleted.');
        }

        Storage::disk('public')->delete($document->storage_key);
        $document->delete();

        return redirect()->route('applications.show', $application)->with('success', 'Document deleted successfully.');
    }

    /**
     * Reviewer decision on a single document.
     */
    public function review(Request $request, ShowroomApplication $application, ShowroomDocument $document)
    {
        $this->ensureBelongs($application, $document);

        if (! $this->canReview($request->user())) {
            abort(403, 'You do not have permission to review documents.');
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in([
                ShowroomDocumentStatus::Approved->value,
                ShowroomDocumentStatus::Rejected->value,
            ])],
            'review_note' => 'nullable|string',
        ]);

        $document->update([
            'status' => $validated['status'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_note' => $validated['review_note'] ?? null,
        ]);

        return redirect()->route('applications.show', $application)->with('success', 'Document review recorded.');
    }

    public function download(Request $request, ShowroomApplication $application, ShowroomDocument $document)
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

    protected function ensureBelongs(ShowroomApplication $application, ShowroomDocument $document): void
    {
        if ($document->showroom_application_id !== $application->id) {
            abort(404);
        }
    }
}
