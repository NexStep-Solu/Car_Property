<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseApiController;
use App\Http\Resources\PaymentCollectionResource;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends BaseApiController
{
    /**
     * Search payments (provider reference, status, provider).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['subscription.showroom', 'payer'])->latest('id');

        if ($request->filled('q')) {
            $query->where('provider_reference', 'like', '%'.$request->query('q').'%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('provider')) {
            $query->where('provider', $request->query('provider'));
        }

        $payments = $query->paginate(min((int) $request->input('per_page', 20), 100));

        return (new PaymentCollectionResource($payments))->response();
    }
}
