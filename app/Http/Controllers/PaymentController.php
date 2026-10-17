<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PaymentController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected function isSuperAdmin(User $user): bool
    {
        return $user->hasRole('super_admin', 'admin');
    }

    protected function showroomRole(User $user, int $showroomId): ?string
    {
        $showroom = \App\Models\Showroom::find($showroomId);
        if (! $showroom) {
            return null;
        }

        if ($showroom->owner_user_id === $user->id) {
            return 'owner';
        }

        return $showroom->users()->wherePivot('is_active', true)->where('users.id', $user->id)->first()?->pivot->member_role;
    }

    protected function canPay(User $user, Subscription $subscription): bool
    {
        if ($this->isSuperAdmin($user) || $subscription->showroom->owner_user_id === $user->id) {
            return true;
        }

        return in_array($this->showroomRole($user, $subscription->showroom_id), ['owner', 'manager'], true);
    }

    protected function visibleTo(User $user, Subscription $subscription): bool
    {
        return $this->canPay($user, $subscription)
            || $user->hasAnyRole(['super_admin', 'reviewer', 'support'], 'admin');
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = Payment::with(['subscription.showroom:id,business_name', 'payer:id,name'])->latest();

        if (! $user->hasAnyRole(['super_admin', 'reviewer', 'support'], 'admin')) {
            $showroomIds = \App\Models\Showroom::where('owner_user_id', $user->id)->pluck('id')
                ->merge(\App\Models\Showroom::whereHas('users', fn ($q) => $q->where('users.id', $user->id)->wherePivot('is_active', true))->pluck('id'))
                ->unique()->values()->all();
            $query->where(function ($q) use ($user, $showroomIds) {
                $q->where('payer_user_id', $user->id)
                    ->orWhereHas('subscription', fn ($q) => $q->whereIn('showroom_id', $showroomIds));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        return Inertia::render('Payments/Index', [
            'payments' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['status']),
            'statuses' => array_column(PaymentStatus::cases(), 'value'),
        ]);
    }

    public function show(Request $request, Payment $payment)
    {
        $payment->load(['subscription.showroom:id,business_name', 'payer:id,name,email', 'confirmer:id,name']);

        if (! $this->visibleTo($request->user(), $payment->subscription)) {
            abort(403, 'You do not have permission to view this payment.');
        }

        return Inertia::render('Payments/Show', [
            'payment' => $payment,
            'canConfirm' => $this->isSuperAdmin($request->user()),
        ]);
    }

    /**
     * Record a manual/provider payment against a subscription.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subscription_id' => ['required', Rule::exists('subscriptions', 'id')],
            'provider' => 'required|string|max:60',
            'amount' => 'required|integer|min:0',
            'currency' => 'required|string|size:3',
        ]);

        $subscription = Subscription::findOrFail($validated['subscription_id']);

        if (! $this->canPay($request->user(), $subscription)) {
            abort(403, 'You do not have permission to pay for this subscription.');
        }

        $payment = Payment::create([
            'subscription_id' => $subscription->id,
            'payer_user_id' => $request->user()->id,
            'provider' => $validated['provider'],
            'amount' => $validated['amount'],
            'currency' => $validated['currency'],
            'status' => PaymentStatus::Pending->value,
            'idempotency_key' => (string) Str::uuid(),
        ]);

        return redirect()->route('payments.show', $payment)->with('success', 'Payment recorded. Awaiting confirmation.');
    }

    /**
     * Super Admin confirms a pending payment. Subscription activation,
     * owner notification and audit are handled by PaymentObserver.
     */
    public function confirm(Request $request, Payment $payment)
    {
        if (! $this->isSuperAdmin($request->user())) {
            abort(403, 'Only Super Admins can confirm payments.');
        }

        if ($payment->status !== PaymentStatus::Pending) {
            abort(422, 'Only pending payments can be confirmed.');
        }

        $payment->update([
            'status' => PaymentStatus::Succeeded->value,
            'paid_at' => now(),
            'confirmed_by' => $request->user()->id,
        ]);

        return redirect()->route('payments.show', $payment)->with('success', 'Payment confirmed and subscription activated.');
    }

    /**
     * Super Admin refunds a succeeded payment (full or partial).
     */
    public function refund(Request $request, Payment $payment)
    {
        if (! $this->isSuperAdmin($request->user())) {
            abort(403, 'Only Super Admins can refund payments.');
        }

        if ($payment->status !== PaymentStatus::Succeeded) {
            abort(422, 'Only succeeded payments can be refunded.');
        }

        $validated = $request->validate([
            'type' => ['required', Rule::in(['full', 'partial'])],
        ]);

        $payment->update([
            'status' => $validated['type'] === 'full'
                ? PaymentStatus::Refunded->value
                : PaymentStatus::PartiallyRefunded->value,
        ]);

        return redirect()->route('payments.show', $payment)->with('success', 'Payment refunded.');
    }
}
