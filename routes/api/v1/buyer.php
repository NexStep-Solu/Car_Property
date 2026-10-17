<?php

use App\Http\Controllers\Api\V1\FavoriteController;
use App\Http\Controllers\Api\V1\PurchaseInquiryController;
use App\Http\Middleware\EnsureSellerPermission;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me/favorites', [FavoriteController::class, 'index']);
    Route::post('/me/favorites/{car:uuid}', [FavoriteController::class, 'store']);
    Route::delete('/me/favorites/{car:uuid}', [FavoriteController::class, 'destroy']);

    Route::post('/purchase-inquiries', [PurchaseInquiryController::class, 'store'])
        ->middleware('throttle:inquiries');
    Route::get('/me/purchase-inquiries', [PurchaseInquiryController::class, 'myInquiries']);

    // NOTE: Spatie's `permission:manage own listings,web` cannot be used here —
    // it reads Auth::guard('web')->user() (session), which is always null for
    // stateless Sanctum token requests. EnsureSellerPermission performs the
    // equivalent check against $request->user() instead.
    Route::get('/seller/inquiries', [PurchaseInquiryController::class, 'sellerInbox'])
        ->middleware(EnsureSellerPermission::class);
    Route::get('/seller/inquiries/{inquiry:uuid}', [PurchaseInquiryController::class, 'sellerShow']);
    Route::patch('/seller/inquiries/{inquiry:uuid}', [PurchaseInquiryController::class, 'sellerUpdate']);
});
