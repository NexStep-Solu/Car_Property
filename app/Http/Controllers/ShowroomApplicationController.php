<?php

namespace App\Http\Controllers;

use App\Enums\ShowroomApplicationStatus;
use App\Enums\ShowroomDocumentStatus;
use App\Enums\ShowroomDocumentType;
use App\Enums\ShowroomVerificationStatus;
use App\Models\Showroom;
use App\Models\ShowroomApplication;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ShowroomApplicationController extends Controller
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

    /**
     * Owner, active owner/manager members, or super_admin.
     */
    protected function canManage(User $user, Showroom $showroom): bool
    {
        if ($this->isPlatformAdmin($user) || $this->isOwner($user, $showroom)) {
            return true;
        }

        return in_array($this->activeMemberRole($user, $showroom), ['owner', 'manager'], true);
    }

    /**
     * Showrooms the user may file applications for.
     */
    protected function manageableShowroomIds(User $user): array
    {
        if ($this->isPlatformAdmin($user)) {
            return Showroom::pluck('id')->all();
        }

        $owned = Showroom::where('owner_user_id', $user->id)->pluck('id')->all();
        $member = Showroom::whereHas('users', function ($q) use ($user) {
            // `whereHas` passes an Eloquent Builder, not the BelongsToMany
            // relation, so pivot columns must be table-qualified.
            $q->where('users.id', $user->id)->where('showroom_users.is_active', true);
        })->pluck('id')->all();

        return array_values(array_unique(array_merge($owned, $member)));
    }

    protected function canDelete(User $user, ShowroomApplication $application): bool
    {
        if (! $this->canManage($user, $application->showroom)) {
            return false;
        }

        return $application->status === ShowroomApplicationStatus::Draft
            || $user->hasRole('super_admin', 'admin');
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = ShowroomApplication::with(['showroom:id,business_name,slug', 'submitter:id,name,email'])->latest();

        if (! $this->isPlatformAdmin($user)) {
            $query->whereIn('showroom_id', $this->manageableShowroomIds($user));
        }

        return Inertia::render('Applications/Index', [
            'applications' => $query->paginate(10)->through(fn ($application) => [
                ...$application->toArray(),
                'can_delete' => $this->canDelete($user, $application),
            ]),
            'canReview' => $this->canReview($user),
        ]);
    }

    public function create(Request $request)
    {
        $showrooms = Showroom::whereIn('id', $this->manageableShowroomIds($request->user()))
            ->orderBy('business_name')
            ->get(['id', 'business_name', 'slug']);

        return Inertia::render('Applications/Create', [
            'showrooms' => $showrooms,
            'preselectedShowroomId' => (int) $request->query('showroom_id', 0) ?: null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'showroom_id' => ['required', Rule::exists('showrooms', 'id')],
        ]);

        $showroom = Showroom::findOrFail($validated['showroom_id']);

        if (! $this->canManage($request->user(), $showroom)) {
            abort(403, 'You do not have permission to file applications for this showroom.');
        }

        $openExists = $showroom->applications()
            ->whereIn('status', [
                ShowroomApplicationStatus::Draft->value,
                ShowroomApplicationStatus::Submitted->value,
                ShowroomApplicationStatus::ChangesRequested->value,
            ])
            ->exists();

        if ($openExists) {
            return back()->withErrors(['showroom_id' => 'This showroom already has an open application.']);
        }

        $application = ShowroomApplication::create([
            'showroom_id' => $showroom->id,
            'submitted_by' => $request->user()->id,
            'status' => ShowroomApplicationStatus::Draft->value,
        ]);

        return redirect()->route('applications.show', $application)->with('success', 'Application created. Upload documents, then submit it for review.');
    }

    public function show(Request $request, ShowroomApplication $application)
    {
        $application->load(['showroom:id,business_name,slug,verification_status', 'submitter:id,name,email', 'reviewer:id,name,email', 'documents.reviewer:id,name']);

        if (! $this->canManage($request->user(), $application->showroom) && ! $this->isPlatformAdmin($request->user())) {
            abort(403, 'You do not have permission to view this application.');
        }

        return Inertia::render('Applications/Show', [
            'application' => $application,
            'canManage' => $this->canManage($request->user(), $application->showroom),
            'canReview' => $this->canReview($request->user()),
            'canDelete' => $this->canDelete($request->user(), $application),
            'statuses' => array_column(ShowroomApplicationStatus::cases(), 'value'),
            'documentTypes' => array_column(ShowroomDocumentType::cases(), 'value'),
            'documentStatuses' => array_column(ShowroomDocumentStatus::cases(), 'value'),
        ]);
    }

    public function destroy(Request $request, ShowroomApplication $application)
    {
        if (! $this->canDelete($request->user(), $application)) {
            abort(403, 'Only draft applications can be deleted.');
        }

        $application->delete();

        return redirect()->route('applications.index')->with('success', 'Application deleted successfully.');
    }

    /**
     * Owner/manager moves a draft (or changes-requested) application to submitted.
     */
    public function submit(Request $request, ShowroomApplication $application)
    {
        if (! $this->canManage($request->user(), $application->showroom)) {
            abort(403, 'You do not have permission to submit this application.');
        }

        if (! in_array($application->status, [ShowroomApplicationStatus::Draft, ShowroomApplicationStatus::ChangesRequested], true)) {
            abort(422, 'Only draft applications can be submitted.');
        }

        $application->update([
            'status' => ShowroomApplicationStatus::Submitted->value,
            'submitted_at' => now(),
            'reviewed_by' => null,
            'reviewed_at' => null,
            'review_reason' => null,
        ]);

        return redirect()->route('applications.show', $application)->with('success', 'Application submitted for review.');
    }

    /**
     * Reviewer decision: approved / rejected / changes_requested.
     */
    public function review(Request $request, ShowroomApplication $application)
    {
        if (! $this->canReview($request->user())) {
            abort(403, 'You do not have permission to review applications.');
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in([
                ShowroomApplicationStatus::Approved->value,
                ShowroomApplicationStatus::Rejected->value,
                ShowroomApplicationStatus::ChangesRequested->value,
            ])],
            'review_reason' => 'nullable|string',
        ]);

        if (in_array($validated['status'], [ShowroomApplicationStatus::Rejected->value, ShowroomApplicationStatus::ChangesRequested->value], true)) {
            $request->validate(['review_reason' => 'required|string']);
        }

        $application->update([
            'status' => $validated['status'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_reason' => $validated['review_reason'] ?? null,
        ]);

        // Keep the showroom verification in sync with the decision.
        if ($validated['status'] === ShowroomApplicationStatus::Approved->value) {
            $application->showroom->update([
                'verification_status' => ShowroomVerificationStatus::Approved->value,
                'approved_at' => now(),
            ]);
        } elseif ($validated['status'] === ShowroomApplicationStatus::Rejected->value) {
            $application->showroom->update([
                'verification_status' => ShowroomVerificationStatus::Rejected->value,
            ]);
        }

        return redirect()->route('applications.show', $application)->with('success', 'Review recorded.');
    }
}
