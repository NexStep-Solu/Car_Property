<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminPermission
{
    /**
     * Same intent as Spatie's `permission:{name},admin`, but evaluated with
     * an explicit 'admin' guard: Spatie's middleware calls $user->canAny()
     * which resolves permissions against the User model's default guard
     * ('web'), so admin-guard permissions never match.
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        try {
            $allowed = $user && $user->hasPermissionTo($permission, 'admin');
        } catch (PermissionDoesNotExist) {
            $allowed = false;
        }

        if (! $allowed) {
            return response()->json([
                'error' => [
                    'code' => 'PERMISSION_DENIED',
                    'message' => 'You do not have permission to perform this action.',
                    'errors' => [],
                ],
            ], 403);
        }

        return $next($request);
    }
}
