<?php

namespace App\Http\Controllers;

use App\Models\PaymentWebhookEvent;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentWebhookEventController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected function ensureSuperAdmin(User $user): void
    {
        if (! $user->hasRole('super_admin', 'admin')) {
            abort(403, 'Only Super Admins can view webhook events.');
        }
    }

    public function index(Request $request)
    {
        $this->ensureSuperAdmin($request->user());

        $query = PaymentWebhookEvent::latest('id');

        if ($request->filled('provider')) {
            $query->where('provider', $request->query('provider'));
        }
        if ($request->query('pending') === '1') {
            $query->whereNull('processed_at');
        }

        return Inertia::render('Webhooks/Index', [
            'events' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['provider', 'pending']),
            'providers' => PaymentWebhookEvent::distinct()->pluck('provider'),
        ]);
    }

    public function show(Request $request, PaymentWebhookEvent $webhookEvent)
    {
        $this->ensureSuperAdmin($request->user());

        return Inertia::render('Webhooks/Show', [
            'event' => $webhookEvent,
        ]);
    }
}
