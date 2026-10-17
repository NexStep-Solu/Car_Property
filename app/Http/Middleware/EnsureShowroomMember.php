<?php

namespace App\Http\Middleware;

use App\Models\Showroom;
use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

class EnsureShowroomMember
{
    /**
     * The resolved showroom comes from the {showroom} route parameter
     * (or a showroom_id input as fallback). Routes without either fall
     * back to the member's primary showroom (owned first, then managed).
     * Owners, active members and Super Admins pass; everyone else gets a 403.
     *
     * On success the Spatie team context is set to the showroom id so
     * team-scoped (showroom-scoped) role/permission grants resolve for
     * this request, then restored afterwards. Membership flags are
     * computed BEFORE the team switch and attached to the request, since
     * global (null-team) role checks like super_admin are not visible
     * while a team id is active.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403, 'Authentication required.');
        }

        $showroom = $request->route('showroom');

        if (is_numeric($showroom)) {
            $showroom = Showroom::find($showroom);
        }

        if (! $showroom instanceof Showroom && $request->filled('showroom_id')) {
            $showroom = Showroom::find($request->input('showroom_id'));
        }

        if (! $showroom instanceof Showroom) {
            $showroom = Showroom::where('owner_user_id', $user->id)->latest('id')->first()
                ?? Showroom::whereHas('users', fn ($q) => $q->where('users.id', $user->id)->wherePivot('is_active', true))
                    ->latest('id')
                    ->first();
        }

        if (! $showroom instanceof Showroom) {
            abort(404, 'Showroom not found.');
        }

        $isOwner = $showroom->owner_user_id === $user->id;
        $isSuperAdmin = $user->hasRole('super_admin', 'admin');

        if (! $isOwner && ! $isSuperAdmin) {
            $isActiveMember = $showroom->users()
                ->wherePivot('is_active', true)
                ->where('users.id', $user->id)
                ->exists();

            if (! $isActiveMember) {
                abort(403, 'You must be an active member of this showroom.');
            }
        }

        $request->attributes->set('showroom', $showroom);
        $request->attributes->set('showroom_is_owner', $isOwner);
        $request->attributes->set('showroom_is_super_admin', $isSuperAdmin);

        $registrar = app(PermissionRegistrar::class);
        $previousTeamId = $registrar->getPermissionsTeamId();

        $registrar->setPermissionsTeamId($showroom->getKey());
        $user->unsetRelation('roles')->unsetRelation('permissions');

        try {
            return $next($request);
        } finally {
            $registrar->setPermissionsTeamId($previousTeamId);
            $user->unsetRelation('roles')->unsetRelation('permissions');
        }
    }
}
