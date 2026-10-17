<?php

use App\Http\Middleware\EnsureAdminPermission;
use App\Http\Middleware\EnsureShowroomMember;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        channels: __DIR__.'/../routes/channels.php',
        then: function () {
            Broadcast::routes(['middleware' => ['web', 'auth']]);
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
            'admin.permission' => EnsureAdminPermission::class,
            'showroom.member' => EnsureShowroomMember::class,
            'permission' => PermissionMiddleware::class,
            'role' => RoleMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                $code = match (true) {
                    $e instanceof AuthenticationException => 'AUTHENTICATION_REQUIRED',
                    $e instanceof AuthorizationException => 'PERMISSION_DENIED',
                    $e instanceof ModelNotFoundException => 'RESOURCE_NOT_FOUND',
                    $e instanceof ValidationException => 'VALIDATION_ERROR',
                    $e instanceof HttpException => match ($e->getStatusCode()) {
                        401 => 'AUTHENTICATION_REQUIRED',
                        403 => 'PERMISSION_DENIED',
                        404 => 'RESOURCE_NOT_FOUND',
                        429 => 'RATE_LIMIT_EXCEEDED',
                        default => 'SERVER_ERROR',
                    },
                    default => 'SERVER_ERROR',
                };

                $status = match ($code) {
                    'AUTHENTICATION_REQUIRED' => 401,
                    'PERMISSION_DENIED' => 403,
                    'RESOURCE_NOT_FOUND' => 404,
                    'VALIDATION_ERROR' => 422,
                    'RATE_LIMIT_EXCEEDED' => 429,
                    default => 500,
                };

                $errors = $e instanceof ValidationException
                    ? $e->errors()
                    : [];

                return response()->json([
                    'error' => [
                        'code' => $code,
                        'message' => $e->getMessage() ?: 'Request failed',
                        'errors' => $errors,
                    ],
                ], $status);
            }
        });
    })->create();
