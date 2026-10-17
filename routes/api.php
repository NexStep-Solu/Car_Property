<?php

use Illuminate\Support\Facades\Route;

// NOTE: the default `api` middleware group in Laravel 11+ no longer
// includes throttling, so `throttle:api` is applied to all v1 routes here.
Route::prefix('v1')->middleware('throttle:api')->group(function () {
    require __DIR__.'/api/v1/public.php';
    require __DIR__.'/api/v1/auth.php';
    require __DIR__.'/api/v1/buyer.php';
    require __DIR__.'/api/v1/notifications.php';
    require __DIR__.'/api/v1/seller.php';
    require __DIR__.'/api/v1/showroom.php';
    require __DIR__.'/api/v1/admin.php';
    require __DIR__.'/api/v1/webhooks.php';
});
