<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Enums\CarStatus;
use App\Enums\SellerVerificationStatus;
use App\Enums\ShowroomVerificationStatus;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Http\Requests\Api\V1\Seller\StoreCarRequest;
use App\Http\Requests\Api\V1\Seller\UpdateCarRequest;
use App\Http\Requests\Api\V1\Seller\UploadCarImageRequest;
use App\Http\Resources\CarCollectionResource;
use App\Http\Resources\CarResource;
use App\Models\Car;
use App\Models\CarImage;
use App\Models\Showroom;
use App\Services\ListingLimitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CarController extends BaseApiController
{
    /**
     * Cars the user owns directly or via a managed showroom.
     */
    protected function ownCars(Request $request)
    {
        $user = $request->user();

        $showroomIds = Showroom::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
                ->orWhereHas('users', fn ($q) => $q->where('users.id', $user->id)->where('showroom_users.is_active', true));
        })->pluck('id');

        return Car::where(function ($q) use ($user, $showroomIds) {
            $q->where('seller_user_id', $user->id)
                ->orWhereIn('showroom_id', $showroomIds);
        });
    }

    protected function ownCar(Request $request, Car $car): Car
    {
        $owned = (clone $this->ownCars($request))->whereKey($car->id)->exists();

        if (! $owned) {
            abort(404);
        }

        return $car;
    }

    public function index(Request $request): JsonResponse
    {
        $cars = $this->ownCars($request)
            ->with(['images', 'category', 'make', 'model'])
            ->latest('id')
            ->paginate(min((int) $request->input('per_page', 20), 100));

        return (new CarCollectionResource($cars))->response();
    }

    public function show(Request $request, Car $car): JsonResponse
    {
        $car = $this->ownCar($request, $car);
        $car->load(['images', 'category', 'make', 'model', 'statusHistory']);

        return $this->ok(new CarResource($car));
    }

    public function store(StoreCarRequest $request, ListingLimitService $limits): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        if (filled($validated['showroom_id'] ?? null)) {
            $showroom = Showroom::findOrFail($validated['showroom_id']);
            $this->ensureShowroomSeller($user, $showroom);

            $check = $limits->check($showroom);
            if (! $check['allowed']) {
                return $this->error($check['reason'] ?? 'LISTING_LIMIT_REACHED', 'This showroom cannot list another car.', 422);
            }

            $attributes = $this->carAttributes($validated) + [
                'showroom_id' => $showroom->id,
                'seller_user_id' => null,
            ];
        } else {
            $this->ensureApprovedIndividual($user);

            $attributes = $this->carAttributes($validated) + [
                'seller_user_id' => $user->id,
                'showroom_id' => null,
            ];
        }

        $attributes['status'] = CarStatus::Draft->value;

        $car = Car::create($attributes);
        $car->statusHistory()->create([
            'from_status' => null,
            'to_status' => CarStatus::Draft->value,
            'changed_by' => $user->id,
        ]);

        return $this->created(new CarResource($car->load(['images', 'category', 'make', 'model'])));
    }

    public function update(UpdateCarRequest $request, Car $car): JsonResponse
    {
        $car = $this->ownCar($request, $car);

        if (! in_array($car->status, [CarStatus::Draft, CarStatus::ChangesRequested], true)) {
            return $this->error('CAR_LOCKED', 'Only draft listings can be updated.', 422);
        }

        $validated = $request->validated();
        if (array_key_exists('price', $validated)) {
            $validated['price_amount'] = $validated['price'];
            unset($validated['price']);
        }

        $car->update($validated);

        return $this->ok(new CarResource($car->fresh()->load(['images', 'category', 'make', 'model'])));
    }

    public function uploadImage(UploadCarImageRequest $request, Car $car): JsonResponse
    {
        $car = $this->ownCar($request, $car);

        $validated = $request->validated();
        $file = $request->file('image');

        $image = $car->images()->create([
            'storage_key' => $file->store('car-images', 'public'),
            'alt_text' => $validated['alt_text'] ?? null,
            'sort_order' => (int) $car->images()->max('sort_order') + 1,
            'is_primary' => ! $car->images()->exists(),
        ]);

        return $this->created($image);
    }

    public function deleteImage(Request $request, Car $car, CarImage $image): JsonResponse
    {
        $car = $this->ownCar($request, $car);

        if ($image->car_id !== $car->id) {
            abort(404);
        }

        Storage::disk('public')->delete($image->storage_key);
        $wasPrimary = $image->is_primary;
        $image->delete();

        if ($wasPrimary) {
            $car->images()->orderBy('sort_order')->first()?->update(['is_primary' => true]);
        }

        return $this->noContent();
    }

    public function submit(Request $request, Car $car): JsonResponse
    {
        $car = $this->ownCar($request, $car);

        if (! in_array($car->status, [CarStatus::Draft, CarStatus::ChangesRequested], true)) {
            return $this->error('CAR_LOCKED', 'Only draft listings can be submitted.', 422);
        }

        \App\Observers\CarObserver::setChangeReason($car, $request->input('reason'));
        $car->update(['status' => CarStatus::PendingReview->value]);

        return $this->ok(new CarResource($car->fresh()));
    }

    public function markSold(Request $request, Car $car): JsonResponse
    {
        $car = $this->ownCar($request, $car);

        if ($car->status !== CarStatus::Published) {
            return $this->error('CAR_LOCKED', 'Only published listings can be marked sold.', 422);
        }

        \App\Observers\CarObserver::setChangeReason($car, $request->input('reason'));
        $car->update(['status' => CarStatus::Sold->value, 'sold_at' => now()]);

        return $this->ok(new CarResource($car->fresh()));
    }

    public function archive(Request $request, Car $car): JsonResponse
    {
        $car = $this->ownCar($request, $car);

        \App\Observers\CarObserver::setChangeReason($car, $request->input('reason'));
        $car->update(['status' => CarStatus::Archived->value]);

        return $this->ok(new CarResource($car->fresh()));
    }

    /**
     * Individual sellers need an approved seller profile.
     */
    protected function ensureApprovedIndividual($user): void
    {
        $profile = $user->sellerProfile;

        if (! $profile || $profile->verification_status !== SellerVerificationStatus::Approved) {
            abort(response()->json([
                'error' => ['code' => 'SELLER_NOT_APPROVED', 'message' => 'Your seller account is not approved yet.', 'errors' => []],
            ], 403));
        }
    }

    /**
     * Showroom listings need an approved showroom.
     */
    protected function ensureShowroomSeller($user, Showroom $showroom): void
    {
        $isOwner = $showroom->owner_user_id === $user->id;
        $role = $showroom->users()->wherePivot('is_active', true)->where('users.id', $user->id)->first()?->pivot->member_role;

        if (! $isOwner && ! in_array($role, ['owner', 'manager'], true) && ! $user->hasRole('super_admin', 'admin')) {
            abort(response()->json([
                'error' => ['code' => 'PERMISSION_DENIED', 'message' => 'You cannot list cars for this showroom.', 'errors' => []],
            ], 403));
        }

        if ($showroom->verification_status !== ShowroomVerificationStatus::Approved && ! $user->hasRole('super_admin', 'admin')) {
            abort(response()->json([
                'error' => ['code' => 'SHOWROOM_NOT_APPROVED', 'message' => 'This showroom is not approved yet.', 'errors' => []],
            ], 403));
        }
    }

    protected function carAttributes(array $validated): array
    {
        if (array_key_exists('price', $validated)) {
            $validated['price_amount'] = $validated['price'];
            unset($validated['price']);
        }
        unset($validated['showroom_id']);

        return $validated;
    }
}
