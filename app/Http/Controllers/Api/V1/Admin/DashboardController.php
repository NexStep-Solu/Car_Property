<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\CarStatus;
use App\Enums\ReportStatus;
use App\Enums\SellerVerificationStatus;
use App\Enums\ShowroomVerificationStatus;
use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Car;
use App\Models\Report;
use App\Models\SellerProfile;
use App\Models\Showroom;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends BaseApiController
{
    /**
     * Platform-wide activity counters for the admin dashboard.
     */
    public function index(Request $request): JsonResponse
    {
        return $this->ok([
            'pending_sellers' => SellerProfile::where('verification_status', SellerVerificationStatus::Pending)->count(),
            'pending_showrooms' => Showroom::where('verification_status', ShowroomVerificationStatus::Pending)->count(),
            'pending_cars' => Car::where('status', CarStatus::PendingReview)->count(),
            'total_users' => User::count(),
            'total_published_cars' => Car::where('status', CarStatus::Published)->count(),
            'active_subscriptions' => Subscription::where('status', SubscriptionStatus::Active)->count(),
            'open_reports' => Report::where('status', ReportStatus::Open)->count(),
        ]);
    }
}
