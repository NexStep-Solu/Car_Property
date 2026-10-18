<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CarStatus;
use App\Enums\InquiryStatus;
use App\Http\Requests\Api\V1\Inquiry\StorePurchaseInquiryRequest;
use App\Http\Requests\Api\V1\Inquiry\UpdateInquiryStatusRequest;
use App\Http\Resources\PurchaseInquiryCollectionResource;
use App\Http\Resources\PurchaseInquiryResource;
use App\Models\Car;
use App\Models\Inquiry;
use App\Models\Showroom;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PurchaseInquiryController extends BaseApiController
{
    /**
     * Cars the user owns directly or via a managed showroom.
     */
    protected function ownCarIds(Request $request): Builder
    {
        $user = $request->user();

        $showroomIds = Showroom::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
                ->orWhereHas('users', fn ($q) => $q->where('users.id', $user->id)->where('showroom_users.is_active', true));
        })->pluck('id');

        return Car::query()
            ->where(function ($q) use ($user, $showroomIds) {
                $q->where('seller_user_id', $user->id)
                    ->orWhereIn('showroom_id', $showroomIds);
            })
            ->select('id');
    }

    protected function ensureCanManage(Request $request, Inquiry $inquiry): void
    {
        $user = $request->user();

        $canManage = $inquiry->receiver_user_id === $user->id
            || ($inquiry->car_id !== null && (clone $this->ownCarIds($request))->whereKey($inquiry->car_id)->exists());

        if (! $canManage) {
            abort(404);
        }
    }

    public function store(StorePurchaseInquiryRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $car = Car::where('uuid', $validated['car_id'])->first();

        if (! $car || $car->status !== CarStatus::Published) {
            throw ValidationException::withMessages([
                'car_id' => 'This car is not available for inquiries.',
            ]);
        }

        $car->loadMissing('showroom');

        $inquiry = Inquiry::create([
            'car_id' => $car->id,
            'sender_user_id' => $user->id,
            'receiver_user_id' => $car->seller_user_id ?? $car->showroom?->owner_user_id,
            'message' => $validated['message'],
            'contact_phone' => $validated['contact_phone'] ?? null,
            'contact_method' => $validated['preferred_contact_method'] ?? null,
            'status' => InquiryStatus::New->value,
        ]);

        return $this->created(new PurchaseInquiryResource($inquiry->load(['car', 'sender'])));
    }

    public function myInquiries(Request $request): JsonResponse
    {
        $inquiries = Inquiry::query()
            ->where('sender_user_id', $request->user()->id)
            ->with(['car', 'sender'])
            ->latest('id')
            ->paginate(min((int) $request->input('per_page', 20), 100));

        return (new PurchaseInquiryCollectionResource($inquiries))->response();
    }

    public function sellerInbox(Request $request): JsonResponse
    {
        $user = $request->user();

        $inquiries = Inquiry::query()
            ->where(function ($q) use ($request, $user) {
                $q->where('receiver_user_id', $user->id)
                    ->orWhereIn('car_id', $this->ownCarIds($request));
            })
            ->with(['car', 'sender'])
            ->latest('id')
            ->paginate(min((int) $request->input('per_page', 20), 100));

        return (new PurchaseInquiryCollectionResource($inquiries))->response();
    }

    public function sellerShow(Request $request, Inquiry $inquiry): JsonResponse
    {
        $this->ensureCanManage($request, $inquiry);

        return $this->ok(new PurchaseInquiryResource($inquiry->load(['car', 'sender'])));
    }

    public function sellerUpdate(UpdateInquiryStatusRequest $request, Inquiry $inquiry): JsonResponse
    {
        $this->ensureCanManage($request, $inquiry);

        $inquiry->update(['status' => $request->validated('status')]);

        return $this->ok(new PurchaseInquiryResource($inquiry->fresh()->load(['car', 'sender'])));
    }
}
