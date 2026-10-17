<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSellerPermission
{
    /**
     * Same intent as Spatie's `permission:manage own listings,web`, but
     * evaluated against the request user: Spatie's middleware reads
     * Auth::guard('web') (session), which is always empty for stateless
     * Sanctum token requests.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        try {
            $allowed = $user && $user->hasPermissionTo('manage own listings');
        } catch (\Spatie\Permission\Exceptions\PermissionDoesNotExist) {
            $allowed = false;
        }

        if (! $allowed) {
            return response()->json([
                'error' => [
                    'code' => 'PERMISSION_DENIED',
                    'message' => 'You do not have permission to manage listings.',
                    'errors' => [],
                ],
            ], 403);
        }

        return $next($request);
    }
}
