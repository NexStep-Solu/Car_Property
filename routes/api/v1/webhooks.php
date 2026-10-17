<?php

use App\Http\Controllers\Api\V1\WebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/payments/{provider}', [WebhookController::class, 'handle'])
    ->withoutMiddleware(['auth:sanctum']);
