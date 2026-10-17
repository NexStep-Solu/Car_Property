<?php

namespace App\Http\Controllers;

use App\Enums\ShowroomMemberRole;
use App\Enums\ShowroomVerificationStatus;
use App\Models\Showroom;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ShowroomController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Platform admins (admin guard) bypass showroom scoping.
     */
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

    public function index(Request $request)
    {
        $user = $request->user();

        $query = Showroom::with('owner:id,name,email')->latest();

        if (! $this->isPlatformAdmin($user)) {
            $query->where(function ($q) use ($user) {
                $q->where('owner_user_id', $user->id)
                    ->orWhereHas('users', fn ($q) => $q->where('users.id', $user->id));
            });
        }

        return Inertia::render('Showrooms/Index', [
            'showrooms' => $query->paginate(10)->through(fn ($showroom) => [
                ...$showroom->toArray(),
                'can_delete' => $this->isOwner($user, $showroom) || $user->hasRole('super_admin', 'admin'),
            ]),
            'canCreate' => true,
            'canReview' => $this->canReview($user),
        ]);
    }

    public function create()
    {
        return Inertia::render('Showrooms/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:180',
            'slug' => 'nullable|string|max:200|unique:showrooms,slug',
            'registration_number' => 'nullable|string|max:100',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email|max:254',
            'address' => 'required|string',
            'region' => 'nullable|string|max:100',
            'logo_storage_key' => 'nullable|string|max:500',
            'description' => 'nullable|string',
        ]);

        $validated['slug'] = $this->uniqueSlug($validated['slug'] ?? null, $validated['business_name']);
        $validated['owner_user_id'] = $request->user()->id;
        $validated['verification_status'] = ShowroomVerificationStatus::Pending->value;

        $showroom = Showroom::create($validated);

        $showroom->users()->attach($request->user()->id, [
            'member_role' => ShowroomMemberRole::Owner->value,
            'is_active' => true,
            'joined_at' => now(),
        ]);

        return redirect()->route('showrooms.show', $showroom)->with('success', 'Showroom created successfully.');
    }

    public function show(Request $request, Showroom $showroom)
    {
        $user = $request->user();

        if (! $this->canManage($user, $showroom)) {
            abort(403, 'You do not have permission to view this showroom.');
        }

        $showroom->load(['owner:id,name,email', 'users:id,name,email']);

        $memberIds = $showroom->users->pluck('id')->push($showroom->owner_user_id)->unique()->values();

        return Inertia::render('Showrooms/Show', [
            'showroom' => $showroom,            'members' => $showroom->users->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'email' => $m->email,
                'member_role' => $m->pivot->member_role,
                'is_active' => (bool) $m->pivot->is_active,
                'joined_at' => $m->pivot->joined_at,
            ]),
            'availableUsers' => User::whereNotIn('id', $memberIds)->orderBy('name')->get(['id', 'name', 'email']),
            'applications' => $showroom->applications()->latest()->get(['id', 'uuid', 'status', 'submitted_at']),
            'canApply' => $this->canManage($user, $showroom),
            'canManage' => $this->canManage($user, $showroom),
            'canManageStaff' => $this->isOwner($user, $showroom)
                || $this->activeMemberRole($user, $showroom) === 'manager'
                || $user->hasRole('super_admin', 'admin'),
            'canReview' => $this->canReview($user),
            'isOwner' => $this->isOwner($user, $showroom),
            'canDelete' => $this->isOwner($user, $showroom) || $user->hasRole('super_admin', 'admin'),
            'statuses' => array_column(ShowroomVerificationStatus::cases(), 'value'),
            'memberRoles' => array_column(ShowroomMemberRole::cases(), 'value'),
        ]);
    }

    public function edit(Request $request, Showroom $showroom)
    {
        if (! $this->canManage($request->user(), $showroom)) {
            abort(403, 'You do not have permission to edit this showroom.');
        }

        return Inertia::render('Showrooms/Edit', [
            'showroom' => $showroom,
            'canDelete' => $this->isOwner($request->user(), $showroom) || $request->user()->hasRole('super_admin', 'admin'),
        ]);
    }

    public function update(Request $request, Showroom $showroom)
    {
        if (! $this->canManage($request->user(), $showroom)) {
            abort(403, 'You do not have permission to edit this showroom.');
        }

        $validated = $request->validate([
            'business_name' => 'required|string|max:180',
            'slug' => ['nullable', 'string', 'max:200', Rule::unique('showrooms', 'slug')->ignore($showroom->id)],
            'registration_number' => 'nullable|string|max:100',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email|max:254',
            'address' => 'required|string',
            'region' => 'nullable|string|max:100',
            'logo_storage_key' => 'nullable|string|max:500',
            'description' => 'nullable|string',
        ]);

        if (filled($validated['slug'] ?? null)) {
            $validated['slug'] = $this->uniqueSlug($validated['slug'], $validated['business_name'], $showroom->id);
        }

        $showroom->update($validated);

        return redirect()->route('showrooms.show', $showroom)->with('success', 'Showroom updated successfully.');
    }

    public function destroy(Request $request, Showroom $showroom)
    {
        $user = $request->user();

        if (! $this->isOwner($user, $showroom) && ! $user->hasRole('super_admin', 'admin')) {
            abort(403, 'Only the owner can delete this showroom.');
        }

        $showroom->delete();

        return redirect()->route('showrooms.index')->with('success', 'Showroom deleted successfully.');
    }

    /**
     * Reviewer/admin verification status transition.
     */
    public function updateStatus(Request $request, Showroom $showroom)
    {
        if (! $this->canReview($request->user())) {
            abort(403, 'You do not have permission to review showrooms.');
        }

        $validated = $request->validate([
            'verification_status' => ['required', Rule::in(array_column(ShowroomVerificationStatus::cases(), 'value'))],
        ]);

        $showroom->update([
            'verification_status' => $validated['verification_status'],
            'approved_at' => $validated['verification_status'] === ShowroomVerificationStatus::Approved->value
                ? now()
                : ($validated['verification_status'] === ShowroomVerificationStatus::Pending->value ? null : $showroom->approved_at),
        ]);

        return redirect()->route('showrooms.show', $showroom)->with('success', 'Verification status updated.');
    }

    protected function uniqueSlug(?string $slug, string $businessName, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug ?: $businessName) ?: 'showroom';
        $candidate = $base;
        $i = 2;

        while (Showroom::where('slug', $candidate)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $candidate = "{$base}-{$i}";
            $i++;
        }

        return $candidate;
    }
}
