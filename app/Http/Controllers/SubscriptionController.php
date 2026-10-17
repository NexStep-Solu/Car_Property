<?php

namespace App\Http\Controllers;

use App\Enums\SubscriptionStatus;
use App\Models\Package;
use App\Models\Showroom;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected function isSuperAdmin(User $user): bool
    {
        return $user->hasRole('super_admin', 'admin');
    }

    protected function isPlatformAdmin(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'reviewer', 'support'], 'admin');
    }

    protected function showroomRole(User $user, int $showroomId): ?string
    {
        $showroom = Showroom::find($showroomId);
        if (! $showroom) {
            return null;
        }

        if ($showroom->owner_user_id === $user->id) {
            return 'owner';
        }

        return $showroom->users()->wherePivot('is_active', true)->where('users.id', $user->id)->first()?->pivot->member_role;
    }

    protected function canPurchase(User $user, Showroom $showroom): bool
    {
        return $this->isSuperAdmin($user)
            || $showroom->owner_user_id === $user->id
            || in_array($this->showroomRole($user, $showroom->id), ['owner', 'manager'], true);
    }

    /**
     * Showroom ids the user may purchase for.
     */
    protected function purchasableShowroomIds(User $user): array
    {
        if ($this->isPlatformAdmin($user)) {
            return Showroom::pluck('id')->all();
        }

        $owned = Showroom::where('owner_user_id', $user->id)->pluck('id')->all();
        $member = Showroom::whereHas('users', fn ($q) => $q->where('users.id', $user->id)->wherePivot('is_active', true))
            ->pluck('id')->all();

        return array_values(array_unique(array_merge($owned, $member)));
    }

    protected function visibleTo(User $user, Subscription $subscription): bool
    {
        return $this->isPlatformAdmin($user)
            || in_array($subscription->showroom_id, $this->purchasableShowroomIds($user), true);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = Subscription::with(['showroom:id,business_name', 'package:id,name'])->latest();

        if (! $this->isPlatformAdmin($user)) {
            $query->whereIn('showroom_id', $this->purchasableShowroomIds($user));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        return Inertia::render('Subscriptions/Index', [
            'subscriptions' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['status']),
            'statuses' => array_column(SubscriptionStatus::cases(), 'value'),
            'packages' => Package::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'price_amount', 'currency']),
            'showrooms' => Showroom::whereIn('id', $this->purchasableShowroomIds($user))->orderBy('business_name')->get(['id', 'business_name']),
            'canPurchase' => true,
        ]);
    }

    /**
     * Purchase a package for a showroom (snapshots package terms).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'showroom_id' => ['required', Rule::exists('showrooms', 'id')],
            'package_id' => ['required', Rule::exists('packages', 'id')],
        ]);

        $showroom = Showroom::findOrFail($validated['showroom_id']);
        $package = Package::findOrFail($validated['package_id']);

        if (! $package->is_active && ! $this->isSuperAdmin($request->user())) {
            abort(422, 'This package is not available.');
        }

        if (! $this->canPurchase($request->user(), $showroom)) {
            abort(403, 'You cannot purchase for this showroom.');
        }

        $subscription = Subscription::create([
            'showroom_id' => $showroom->id,
            'package_id' => $package->id,
            'status' => SubscriptionStatus::PendingPayment->value,
            'active_listing_limit_snapshot' => $package->active_listing_limit,
            'price_amount_snapshot' => $package->price_amount,
            'currency_snapshot' => $package->currency,
        ]);

        return redirect()->route('subscriptions.show', $subscription)->with('success', 'Subscription created. Record a payment to activate it.');
    }

    public function show(Request $request, Subscription $subscription)
    {
        if (! $this->visibleTo($request->user(), $subscription)) {
            abort(403, 'You do not have permission to view this subscription.');
        }

        $subscription->load(['showroom:id,business_name,slug', 'package:id,name,duration_days', 'payments.payer:id,name', 'payments.confirmer:id,name']);

        return Inertia::render('Subscriptions/Show', [
            'subscription' => $subscription,
            'canPay' => $this->canPurchase($request->user(), $subscription->showroom),
            'canConfirm' => $this->isSuperAdmin($request->user()),
            'canCancel' => $this->canPurchase($request->user(), $subscription->showroom) || $this->isSuperAdmin($request->user()),
        ]);
    }

    /**
     * Cancel a pending or active subscription.
     */
    public function cancel(Request $request, Subscription $subscription)
    {
        $user = $request->user();

        if (! $this->canPurchase($user, $subscription->showroom) && ! $this->isSuperAdmin($user)) {
            abort(403, 'You do not have permission to cancel this subscription.');
        }

        if (! in_array($subscription->status, [SubscriptionStatus::PendingPayment, SubscriptionStatus::Active], true)) {
            abort(422, 'Only pending or active subscriptions can be cancelled.');
        }

        $subscription->update(['status' => SubscriptionStatus::Cancelled->value]);

        return redirect()->route('subscriptions.show', $subscription)->with('success', 'Subscription cancelled.');
    }
}
