<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Only users authenticated via the admin guard holding at least
     * one admin-guard role may pass. 403 responses surface as the
     * PERMISSION_DENIED error code on API requests (exception renderer).
     *
     * NOTE: the admin guard uses the session driver with the same users
     * provider, so this passes only for sessions established through the
     * admin guard — a web-guard login alone is not enough.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth('admin')->check()) {
            abort(403, 'Admin authentication required.');
        }

        $user = auth('admin')->user();

        $hasAdminRole = $user->roles()
            ->where('guard_name', 'admin')
            ->exists();

        if (! $hasAdminRole) {
            abort(403, 'You do not have permission to access this area.');
        }

        return $next($request);
    }
}
