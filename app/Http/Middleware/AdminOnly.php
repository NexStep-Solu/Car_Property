<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOnly
{
    /**
     * Allow access if user has Spatie admin role or any permission.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (! $user) {
            abort(403, 'You do not have permission to access this page.');
        }

        // Super Admin (admin guard) always passes
        if ($user->hasRole('super_admin', 'admin')) {
            return $next($request);
        }

        // Admin by Spatie role
        if ($user->hasRole('admin')) {
            return $next($request);
        }

        // Any user with at least one permission can access
        if ($user->getAllPermissions()->isNotEmpty()) {
            return $next($request);
        }

        abort(403, 'You do not have permission to access this page.');
    }
}
