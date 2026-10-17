<?php

use App\Http\Controllers\Api\V1\Seller\CarController as SellerCarController;
use App\Http\Controllers\Api\V1\SellerApplicationController;
use App\Http\Middleware\EnsureSellerPermission;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/seller-applications', [SellerApplicationController::class, 'store']);
    Route::get('/seller-applications/me', [SellerApplicationController::class, 'me']);
    Route::patch('/seller-applications/me', [SellerApplicationController::class, 'update']);
    Route::post('/seller-applications/me/documents', [SellerApplicationController::class, 'uploadDocument'])
        ->middleware('throttle:uploads');
    Route::get('/seller-applications/me/documents/{document}', [SellerApplicationController::class, 'downloadDocument']);
    Route::delete('/seller-applications/me/documents/{document}', [SellerApplicationController::class, 'deleteDocument']);
    Route::post('/seller-applications/me/submit', [SellerApplicationController::class, 'submit']);
});

// NOTE: Spatie's `permission:manage own listings,web` cannot be used here —
// it reads Auth::guard('web')->user() (session), which is always null for
// stateless Sanctum token requests. EnsureSellerPermission performs the
// equivalent check against $request->user() instead.
Route::middleware(['auth:sanctum', EnsureSellerPermission::class])->prefix('seller')->group(function () {
    Route::get('/cars', [SellerCarController::class, 'index']);
    Route::post('/cars', [SellerCarController::class, 'store']);
    Route::get('/cars/{car:uuid}', [SellerCarController::class, 'show']);
    Route::patch('/cars/{car:uuid}', [SellerCarController::class, 'update']);
    Route::post('/cars/{car:uuid}/images', [SellerCarController::class, 'uploadImage'])
        ->middleware('throttle:uploads');
    Route::delete('/cars/{car:uuid}/images/{image}', [SellerCarController::class, 'deleteImage']);
    Route::post('/cars/{car:uuid}/submit', [SellerCarController::class, 'submit']);
    Route::post('/cars/{car:uuid}/mark-sold', [SellerCarController::class, 'markSold']);
    Route::post('/cars/{car:uuid}/archive', [SellerCarController::class, 'archive']);
});
