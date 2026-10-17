<?php

use App\Http\Controllers\Api\V1\Admin\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\PackageController as AdminPackageController;
use App\Http\Controllers\Api\V1\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\V1\Admin\UserController as AdminUserController;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;

// NOTE: `auth:admin` is a session guard and /api routes don't run the
// session stack by default, so the cookie/session middleware is added
// explicitly (required for the web admin panel / same-origin clients).
// NOTE: Spatie's `permission:packages.manage,admin` cannot be used here —
// it evaluates $user->canAny(), which resolves against the User model's
// default guard ('web'), so admin-guard permissions never match.
// EnsureAdminPermission performs the equivalent check with an explicit
// 'admin' guard instead.
Route::middleware([
    EncryptCookies::class,
    StartSession::class,
    'auth:admin',
    'admin.permission:packages.manage',
])->prefix('admin')->group(function () {
    Route::get('/packages', [AdminPackageController::class, 'index']);
    Route::post('/packages', [AdminPackageController::class, 'store']);
    Route::patch('/packages/{package}', [AdminPackageController::class, 'update']);
    Route::post('/packages/{package}/deactivate', [AdminPackageController::class, 'deactivate']);
});

Route::middleware([
    EncryptCookies::class,
    StartSession::class,
    'auth:admin',
    'admin.permission:payments.manage',
])->get('/admin/payments', [AdminPaymentController::class, 'index']);

Route::middleware([
    EncryptCookies::class,
    StartSession::class,
    'auth:admin',
    'admin.permission:dashboard.view',
])->get('/admin/dashboard', [DashboardController::class, 'index']);

Route::middleware([
    EncryptCookies::class,
    StartSession::class,
    'auth:admin',
    'admin.permission:users.view',
])->prefix('admin')->group(function () {
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{user:uuid}', [AdminUserController::class, 'show']);
});

Route::middleware([
    EncryptCookies::class,
    StartSession::class,
    'auth:admin',
    'admin.permission:users.manage',
])->patch('/admin/users/{user:uuid}/status', [AdminUserController::class, 'updateStatus']);

Route::middleware([
    EncryptCookies::class,
    StartSession::class,
    'auth:admin',
    'admin.permission:audit_logs.view',
])->get('/admin/audit-logs', [AuditLogController::class, 'index']);
