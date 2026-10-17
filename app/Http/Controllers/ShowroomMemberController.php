<?php

namespace App\Http\Controllers;

use App\Enums\ShowroomMemberRole;
use App\Models\Showroom;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ShowroomMemberController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

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
     * Owner, active managers, or super_admin can manage staff.
     */
    protected function canManageStaff(User $user, Showroom $showroom): bool
    {
        return $this->isOwner($user, $showroom)
            || $this->activeMemberRole($user, $showroom) === ShowroomMemberRole::Manager->value
            || $user->hasRole('super_admin', 'admin');
    }

    public function index(Request $request, Showroom $showroom)
    {
        if (! $this->canManageStaff($request->user(), $showroom)) {
            abort(403, 'You do not have permission to manage staff.');
        }

        $members = $showroom->users()->orderBy('name')->get()->map(fn ($m) => [
            'id' => $m->id,
            'name' => $m->name,
            'email' => $m->email,
            'member_role' => $m->pivot->member_role,
            'is_active' => (bool) $m->pivot->is_active,
            'joined_at' => $m->pivot->joined_at,
        ]);

        return Inertia::render('Showrooms/Members', [
            'showroom' => $showroom->only(['id', 'business_name', 'slug']),
            'members' => $members,
            'memberRoles' => [ShowroomMemberRole::Manager->value, ShowroomMemberRole::Staff->value],
        ]);
    }

    public function store(Request $request, Showroom $showroom)
    {
        if (! $this->canManageStaff($request->user(), $showroom)) {
            abort(403, 'You do not have permission to manage staff.');
        }

        $validated = $request->validate([
            'email' => ['required', 'email', Rule::exists('users', 'email')],
            'member_role' => ['required', Rule::in([ShowroomMemberRole::Manager->value, ShowroomMemberRole::Staff->value])],
        ]);

        $member = User::where('email', $validated['email'])->firstOrFail();

        if ($showroom->users()->where('users.id', $member->id)->exists()) {
            return back()->withErrors(['email' => 'This user is already a member of the showroom.']);
        }

        if ($member->id === $showroom->owner_user_id) {
            return back()->withErrors(['email' => 'The owner is already a member.']);
        }

        $showroom->users()->attach($member->id, [
            'member_role' => $validated['member_role'],
            'is_active' => true,
            'joined_at' => now(),
        ]);

        return redirect()->route('showrooms.show', $showroom)->with('success', 'Member added successfully.');
    }

    public function update(Request $request, Showroom $showroom, User $member)
    {
        if (! $this->canManageStaff($request->user(), $showroom)) {
            abort(403, 'You do not have permission to manage staff.');
        }

        if ($member->id === $showroom->owner_user_id) {
            abort(403, 'The owner membership cannot be changed.');
        }

        if (! $showroom->users()->where('users.id', $member->id)->exists()) {
            abort(404, 'Member not found in this showroom.');
        }

        $validated = $request->validate([
            'member_role' => ['required', Rule::in([ShowroomMemberRole::Manager->value, ShowroomMemberRole::Staff->value])],
            'is_active' => 'required|boolean',
        ]);

        $showroom->users()->updateExistingPivot($member->id, [
            'member_role' => $validated['member_role'],
            'is_active' => $validated['is_active'],
        ]);

        return redirect()->route('showrooms.show', $showroom)->with('success', 'Member updated successfully.');
    }

    public function destroy(Request $request, Showroom $showroom, User $member)
    {
        if (! $this->canManageStaff($request->user(), $showroom)) {
            abort(403, 'You do not have permission to manage staff.');
        }

        if ($member->id === $showroom->owner_user_id) {
            abort(403, 'The owner cannot be removed.');
        }

        $showroom->users()->detach($member->id);

        return redirect()->route('showrooms.show', $showroom)->with('success', 'Member removed successfully.');
    }
}
