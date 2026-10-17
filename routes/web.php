<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CarCategoryController;
use App\Http\Controllers\CarController;
use App\Http\Controllers\CarMakeController;
use App\Http\Controllers\CarModelController;
use App\Http\Controllers\DeviceTokenController;
use App\Http\Controllers\IdentityDocumentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentWebhookEventController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SellerApplicationController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\ShowroomApplicationController;
use App\Http\Controllers\ShowroomController;
use App\Http\Controllers\ShowroomDocumentController;
use App\Http\Controllers\ShowroomMemberController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AdminOnly;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/offline', function () {
    return view('offline');
});

// Root URL IS the login page: localhost:8000 shows login directly.
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return app(AuthenticatedSessionController::class)->create(request());
})->name('login');

Route::post('/', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest')
    ->name('login.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard', [
            'stats' => [
                'users' => \App\Models\User::count(),
                'roles' => \Spatie\Permission\Models\Role::count(),
                'permissions' => \Spatie\Permission\Models\Permission::count(),
            ],
        ]);
    })->name('dashboard');

    Route::middleware([AdminOnly::class])->group(function () {
        Route::resource('users', UserController::class);
        Route::resource('roles', RoleController::class)->except(['create', 'show', 'edit']);
        Route::resource('permissions', PermissionController::class)->except(['create', 'show', 'edit']);
    });

    Route::resource('showrooms', ShowroomController::class);
    Route::post('showrooms/{showroom}/status', [ShowroomController::class, 'updateStatus'])->name('showrooms.status');
    Route::resource('showrooms.members', ShowroomMemberController::class)->except(['create', 'show', 'edit']);

    Route::resource('applications', ShowroomApplicationController::class)->except(['edit', 'update']);
    Route::post('applications/{application}/submit', [ShowroomApplicationController::class, 'submit'])->name('applications.submit');
    Route::post('applications/{application}/review', [ShowroomApplicationController::class, 'review'])->name('applications.review');
    Route::resource('applications.documents', ShowroomDocumentController::class)->only(['store', 'destroy']);
    Route::post('applications/{application}/documents/{document}/review', [ShowroomDocumentController::class, 'review'])->name('applications.documents.review');
    Route::get('applications/{application}/documents/{document}/download', [ShowroomDocumentController::class, 'download'])->name('applications.documents.download');

    Route::resource('cars', CarController::class);
    Route::post('cars/{car}/status', [CarController::class, 'updateStatus'])->name('cars.status');
    Route::post('cars/{car}/images', [CarController::class, 'uploadImage'])->name('cars.images.store');
    Route::delete('cars/{car}/images/{image}', [CarController::class, 'destroyImage'])->name('cars.images.destroy');
    Route::post('cars/{car}/images/{image}/primary', [CarController::class, 'setPrimaryImage'])->name('cars.images.primary');

    Route::get('catalogue', [CarMakeController::class, 'index'])->name('catalogue.index');
    Route::resource('makes', CarMakeController::class)->only(['store', 'update', 'destroy']);
    Route::resource('models', CarModelController::class)->only(['store', 'update', 'destroy']);
    Route::resource('categories', CarCategoryController::class)->only(['store', 'update', 'destroy']);

    Route::prefix('admin')->name('admin.')->middleware([AdminOnly::class])->group(function () {
        Route::resource('settings', SettingController::class)->only(['index', 'store', 'update', 'destroy']);
    });

    // Note: explicit parameter mapping — resource names with dashes would
    // otherwise bind as {seller_application} instead of {application}.
    $sellerParams = ['seller-applications' => 'application'];
    Route::resource('seller-applications', SellerApplicationController::class)->except(['edit', 'update'])->parameters($sellerParams);
    Route::post('seller-applications/{application}/submit', [SellerApplicationController::class, 'submit'])->name('seller-applications.submit');
    Route::post('seller-applications/{application}/review', [SellerApplicationController::class, 'review'])->name('seller-applications.review');
    Route::resource('seller-applications.documents', IdentityDocumentController::class)->only(['store', 'destroy'])->parameters($sellerParams + ['documents' => 'document']);
    Route::post('seller-applications/{application}/documents/{document}/review', [IdentityDocumentController::class, 'review'])->name('seller-applications.documents.review');
    Route::get('seller-applications/{application}/documents/{document}/download', [IdentityDocumentController::class, 'download'])->name('seller-applications.documents.download');

    Route::resource('packages', PackageController::class)->except(['show']);
    Route::resource('subscriptions', SubscriptionController::class)->only(['index', 'store', 'show']);
    Route::post('subscriptions/{subscription}/cancel', [SubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
    Route::resource('payments', PaymentController::class)->only(['index', 'store', 'show']);
    Route::post('payments/{payment}/confirm', [PaymentController::class, 'confirm'])->name('payments.confirm');
    Route::post('payments/{payment}/refund', [PaymentController::class, 'refund'])->name('payments.refund');
    Route::resource('webhooks', PaymentWebhookEventController::class)->only(['index', 'show'])->parameters(['webhooks' => 'webhookEvent']);

    Route::resource('reports', ReportController::class)->only(['index', 'store', 'show', 'destroy']);
    Route::post('reports/{report}/handle', [ReportController::class, 'handle'])->name('reports.handle');
    Route::resource('notifications', NotificationController::class)->only(['index', 'destroy']);
    Route::post('notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::resource('audit-logs', AuditLogController::class)->only(['index']);
    Route::resource('device-tokens', DeviceTokenController::class)->only(['store', 'destroy']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
