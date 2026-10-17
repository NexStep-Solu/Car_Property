<?php

use App\Http\Controllers\Api\V1\Showroom\SubscriptionController;
use App\Http\Controllers\Api\V1\ShowroomApplicationController;
use App\Http\Controllers\Api\V1\ShowroomController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/showroom-applications', [ShowroomApplicationController::class, 'store']);
    Route::get('/showroom-applications/me', [ShowroomApplicationController::class, 'me']);
    Route::patch('/showroom-applications/me', [ShowroomApplicationController::class, 'update']);
    Route::post('/showroom-applications/me/documents', [ShowroomApplicationController::class, 'uploadDocument'])
        ->middleware('throttle:uploads');
    Route::post('/showroom-applications/me/submit', [ShowroomApplicationController::class, 'submit']);

    Route::get('/me/showroom', [ShowroomController::class, 'me']);
    Route::patch('/me/showroom', [ShowroomController::class, 'update']);
});

Route::middleware(['auth:sanctum', 'showroom.member'])->group(function () {
    Route::post('/showroom/subscriptions', [SubscriptionController::class, 'store']);
    Route::get('/showroom/subscription', [SubscriptionController::class, 'me']);
    Route::get('/showroom/payments', [SubscriptionController::class, 'payments']);
});

Route::get('/showrooms/{showroom:slug}', [ShowroomController::class, 'show']);
