<?php

namespace App\Http\Controllers\Api\V1\Showroom;

use App\Enums\PaymentStatus;
use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Http\Requests\Api\V1\Showroom\StoreSubscriptionRequest;
use App\Http\Resources\PaymentCollectionResource;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\SubscriptionResource;
use App\Models\Package;
use App\Models\Payment;
use App\Models\Showroom;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SubscriptionController extends BaseApiController
{
    /**
     * The showroom resolved by the `showroom.member` middleware
     * ({showroom} parameter / showroom_id input, else the member's
     * primary showroom).
     */
    protected function showroom(Request $request): Showroom
    {
        return $request->attributes->get('showroom');
    }

    protected function ensureCanPurchase(Request $request, User $user, Showroom $showroom): void
    {
        // Membership flags were derived by the `showroom.member` middleware
        // BEFORE it switched the Spatie team context; global (null-team)
        // role checks are not reliable while a team id is active.
        if ($request->attributes->get('showroom_is_owner') || $request->attributes->get('showroom_is_super_admin')) {
            return;
        }

        $role = $showroom->users()
            ->wherePivot('is_active', true)
            ->where('users.id', $user->id)
            ->first()?->pivot->member_role;

        if (! in_array($role, ['owner', 'manager'], true)) {
            abort(response()->json([
                'error' => ['code' => 'PERMISSION_DENIED', 'message' => 'Only owners and managers can purchase packages.', 'errors' => []],
            ], 403));
        }
    }

    /**
     * Start checkout: create a pending subscription + pending payment.
     * The subscription activates once the payment is confirmed
     * (webhook or admin confirmation — PaymentObserver handles it).
     */
    public function store(StoreSubscriptionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();
        $showroom = $this->showroom($request);
        $package = Package::findOrFail($validated['package_id']);

        if (! $package->is_active && ! $request->attributes->get('showroom_is_super_admin')) {
            return $this->error('PACKAGE_INACTIVE', 'This package is not available.', 422);
        }

        $this->ensureCanPurchase($request, $user, $showroom);

        [$subscription, $payment] = DB::transaction(function () use ($user, $showroom, $package, $validated) {
            $subscription = Subscription::create([
                'showroom_id' => $showroom->id,
                'package_id' => $package->id,
                'status' => SubscriptionStatus::PendingPayment->value,
                'active_listing_limit_snapshot' => $package->active_listing_limit,
                'price_amount_snapshot' => $package->price_amount,
                'currency_snapshot' => $package->currency,
            ]);

            $payment = Payment::create([
                'subscription_id' => $subscription->id,
                'payer_user_id' => $user->id,
                'provider' => $validated['provider'] ?? 'manual',
                'provider_reference' => (string) Str::uuid(),
                'amount' => $package->price_amount,
                'currency' => $package->currency,
                'status' => PaymentStatus::Pending->value,
                'idempotency_key' => (string) Str::uuid(),
            ]);

            return [$subscription, $payment];
        });

        return $this->created([
            'subscription' => new SubscriptionResource($subscription->load('package')),
            'payment' => new PaymentResource($payment),
        ]);
    }

    /**
     * The showroom's current (latest) subscription.
     */
    public function me(Request $request): JsonResponse
    {
        $showroom = $this->showroom($request);

        $subscription = Subscription::where('showroom_id', $showroom->id)
            ->latest('id')
            ->firstOrFail();

        return $this->ok(new SubscriptionResource($subscription->load('package')));
    }

    /**
     * Payment history for the showroom's subscriptions.
     */
    public function payments(Request $request): JsonResponse
    {
        $showroom = $this->showroom($request);

        $payments = Payment::whereHas('subscription', fn ($q) => $q->where('showroom_id', $showroom->id))
            ->with(['subscription.package', 'payer'])
            ->latest('id')
            ->paginate(min((int) $request->input('per_page', 20), 100));

        return (new PaymentCollectionResource($payments))->response();
    }
}
