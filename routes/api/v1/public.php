<?php

use App\Http\Controllers\Api\V1\CarController;
use App\Http\Controllers\Api\V1\CarMetaController;
use App\Http\Controllers\Api\V1\PackageController;
use Illuminate\Support\Facades\Route;

Route::get('/cars', [CarController::class, 'index']);
// Registered before `/cars/{car:uuid}` so the literal path is not swallowed
// by the implicit model binding.
Route::get('/cars/filters', [CarController::class, 'filters']);
Route::get('/cars/{car:uuid}', [CarController::class, 'show']);
Route::get('/car-makes', [CarMetaController::class, 'makes']);
Route::get('/car-models', [CarMetaController::class, 'models']);
Route::get('/car-categories', [CarMetaController::class, 'categories']);

Route::get('/packages', [PackageController::class, 'index']);
Route::get('/packages/{package:slug}', [PackageController::class, 'show']);
