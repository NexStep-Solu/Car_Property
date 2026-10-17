<?php

namespace App\Http\Controllers;

use App\Enums\IdentityDocumentStatus;
use App\Enums\IdentityDocumentType;
use App\Enums\SellerApplicationStatus;
use App\Enums\SellerType;
use App\Enums\SellerVerificationStatus;
use App\Models\SellerApplication;
use App\Models\SellerProfile;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class SellerApplicationController extends Controller
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

    protected function canSee(User $user, SellerApplication $application): bool
    {
        return $application->user_id === $user->id || $this->isPlatformAdmin($user);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = SellerApplication::with(['user:id,name,email', 'reviewer:id,name'])->latest();

        if (! $this->isPlatformAdmin($user)) {
            $query->where('user_id', $user->id);
        }

        return Inertia::render('Sellers/Index', [
            'applications' => $query->paginate(10),
            'profiles' => $this->isPlatformAdmin($user)
                ? SellerProfile::with('user:id,name,email')->latest()->paginate(10, ['*'], 'profiles_page')
                : SellerProfile::with('user:id,name,email')->where('user_id', $user->id)->get(),
            'canReview' => $this->canReview($user),
        ]);
    }

    public function create()
    {
        return Inertia::render('Sellers/Create', [
            'sellerTypes' => array_column(SellerType::cases(), 'value'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'seller_type' => ['required', Rule::in(array_column(SellerType::cases(), 'value'))],
            'full_name' => 'required|string|max:150',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email|max:254',
            'address' => 'nullable|string',
        ]);

        $openExists = SellerApplication::where('user_id', $request->user()->id)
            ->whereIn('status', [
                SellerApplicationStatus::Draft->value,
                SellerApplicationStatus::PendingReview->value,
                SellerApplicationStatus::ChangesRequested->value,
            ])
            ->exists();

        if ($openExists) {
            return back()->withErrors(['seller_type' => 'You already have an open application.']);
        }

        $application = SellerApplication::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'status' => SellerApplicationStatus::Draft->value,
        ]);

        return redirect()->route('seller-applications.show', $application)->with('success', 'Application created. Upload your ID documents, then submit it.');
    }

    public function show(Request $request, SellerApplication $application)
    {
        if (! $this->canSee($request->user(), $application)) {
            abort(403, 'You do not have permission to view this application.');
        }

        $application->load(['user:id,name,email', 'reviewer:id,name', 'documents.reviewer:id,name']);

        return Inertia::render('Sellers/Show', [
            'application' => $application,
            'canManage' => $application->user_id === $request->user()->id || $request->user()->hasRole('super_admin', 'admin'),
            'canReview' => $this->canReview($request->user()),
            'canDelete' => ($application->user_id === $request->user()->id
                    && $application->status === SellerApplicationStatus::Draft)
                || $request->user()->hasRole('super_admin', 'admin'),
            'statuses' => array_column(SellerApplicationStatus::cases(), 'value'),
            'documentTypes' => array_column(IdentityDocumentType::cases(), 'value'),
            'documentStatuses' => array_column(IdentityDocumentStatus::cases(), 'value'),
        ]);
    }

    public function destroy(Request $request, SellerApplication $application)
    {
        $user = $request->user();

        $isOwnDraft = $application->user_id === $user->id
            && $application->status === SellerApplicationStatus::Draft;

        if (! $isOwnDraft && ! $user->hasRole('super_admin', 'admin')) {
            abort(403, 'Only draft applications can be deleted.');
        }

        $application->delete();

        return redirect()->route('seller-applications.index')->with('success', 'Application deleted successfully.');
    }

    /**
     * Applicant moves a draft (or changes-requested) application to review.
     */
    public function submit(Request $request, SellerApplication $application)
    {
        $user = $request->user();

        if ($application->user_id !== $user->id && ! $user->hasRole('super_admin', 'admin')) {
            abort(403, 'You do not have permission to submit this application.');
        }

        if (! in_array($application->status, [SellerApplicationStatus::Draft, SellerApplicationStatus::ChangesRequested], true)) {
            abort(422, 'Only draft applications can be submitted.');
        }

        $application->update([
            'status' => SellerApplicationStatus::PendingReview->value,
            'submitted_at' => now(),
            'reviewed_by' => null,
            'reviewed_at' => null,
            'review_reason' => null,
        ]);

        return redirect()->route('seller-applications.show', $application)->with('success', 'Application submitted for review.');
    }

    /**
     * Reviewer decision: approved / rejected / changes_requested / suspended.
     */
    public function review(Request $request, SellerApplication $application)
    {
        if (! $this->canReview($request->user())) {
            abort(403, 'You do not have permission to review applications.');
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in([
                SellerApplicationStatus::Approved->value,
                SellerApplicationStatus::Rejected->value,
                SellerApplicationStatus::ChangesRequested->value,
                SellerApplicationStatus::Suspended->value,
            ])],
            'review_reason' => 'nullable|string',
        ]);

        if (in_array($validated['status'], [SellerApplicationStatus::Rejected->value, SellerApplicationStatus::ChangesRequested->value, SellerApplicationStatus::Suspended->value], true)) {
            $request->validate(['review_reason' => 'required|string']);
        }

        $application->update([
            'status' => $validated['status'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_reason' => $validated['review_reason'] ?? null,
        ]);

        $this->syncSellerProfile($application);

        return redirect()->route('seller-applications.show', $application)->with('success', 'Review recorded.');
    }

    /**
     * Keep the seller profile (and seller role) in sync with the decision.
     */
    protected function syncSellerProfile(SellerApplication $application): void
    {
        $profile = SellerProfile::firstOrNew(['user_id' => $application->user_id]);

        $profile->fill([
            'seller_type' => $application->seller_type,
            'display_name' => $application->full_name,
        ]);

        match ($application->status) {
            SellerApplicationStatus::Approved => $profile->fill([
                'verification_status' => SellerVerificationStatus::Approved,
                'approved_at' => $profile->approved_at ?? now(),
                'suspended_at' => null,
                'suspension_reason' => null,
            ]),
            SellerApplicationStatus::Rejected => $profile->fill([
                'verification_status' => SellerVerificationStatus::Rejected,
            ]),
            SellerApplicationStatus::Suspended => $profile->fill([
                'verification_status' => SellerVerificationStatus::Suspended,
                'suspended_at' => now(),
                'suspension_reason' => $application->review_reason,
            ]),
            default => $profile->fill([
                'verification_status' => SellerVerificationStatus::Pending,
            ]),
        };

        $profile->save();

        if ($application->status === SellerApplicationStatus::Approved
            && $application->seller_type === SellerType::Individual) {
            $applicant = $application->user;
            $role = Role::firstOrCreate(
                ['name' => 'individual_seller', 'guard_name' => 'web'],
                ['name' => 'individual_seller', 'guard_name' => 'web']
            );
            if (! $applicant->hasRole($role)) {
                $applicant->assignRole($role);
            }
        }
    }
}
