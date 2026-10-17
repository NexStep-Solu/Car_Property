<?php

namespace App\Providers;

use App\Models\Car;
use App\Models\Payment;
use App\Models\Report;
use App\Models\SellerApplication;
use App\Models\Showroom;
use App\Models\ShowroomApplication;
use App\Models\Subscription;
use App\Models\User;
use App\Observers\CarObserver;
use App\Observers\PaymentObserver;
use App\Observers\ReportObserver;
use App\Observers\SellerApplicationObserver;
use App\Observers\ShowroomApplicationObserver;
use App\Observers\SubscriptionObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', fn (Request $r) => Limit::perMinute(120)->by($r->user()?->id ?: $r->ip()));
        RateLimiter::for('inquiries', fn (Request $r) => Limit::perHour(20)->by($r->user()->id));
        RateLimiter::for('uploads', fn (Request $r) => Limit::perHour(50)->by($r->user()->id));
        RateLimiter::for('auth', fn (Request $r) => Limit::perMinute(5)->by($r->ip()));

        // Short morph aliases used by reports (and audit logs).
        // NOTE: 'inquiry' has no model yet — add it here when it lands.
        Relation::morphMap([
            'car' => Car::class,
            'user' => User::class,
            'showroom' => Showroom::class,
        ]);

        // Super Admin bypasses every authorization check.
        Gate::before(function (User $user) {
            if ($user->hasRole('super_admin', 'admin')) {
                return true;
            }

            return null;
        });

        // Eloquent observers (status-change audit trail).
        Car::observe(CarObserver::class);
        SellerApplication::observe(SellerApplicationObserver::class);
        ShowroomApplication::observe(ShowroomApplicationObserver::class);
        Subscription::observe(SubscriptionObserver::class);
        Payment::observe(PaymentObserver::class);
        Report::observe(ReportObserver::class);
    }
}
