<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CarStatus;
use App\Http\Requests\Api\V1\Car\IndexCarRequest;
use App\Http\Resources\CarCollectionResource;
use App\Http\Resources\CarResource;
use App\Models\Car;
use Illuminate\Http\JsonResponse;

class CarController extends BaseApiController
{
    public function index(IndexCarRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $query = Car::query()
            ->where('status', CarStatus::Published->value)
            ->with(['images', 'category', 'make', 'model', 'seller.sellerProfile', 'showroom.owner.sellerProfile']);

        if (filled($validated['q'] ?? null)) {
            $search = '%'.$validated['q'].'%';
            $query->where(fn ($q) => $q->where('title', 'like', $search)->orWhere('description', 'like', $search));
        }
        foreach (['make_id', 'model_id', 'category_id'] as $field) {
            if (filled($validated[$field] ?? null)) {
                $query->where($field, $validated[$field]);
            }
        }
        if (filled($validated['min_price'] ?? null)) {
            $query->where('price_amount', '>=', $validated['min_price']);
        }
        if (filled($validated['max_price'] ?? null)) {
            $query->where('price_amount', '<=', $validated['max_price']);
        }
        if (filled($validated['year_from'] ?? null)) {
            $query->where('year', '>=', $validated['year_from']);
        }
        if (filled($validated['year_to'] ?? null)) {
            $query->where('year', '<=', $validated['year_to']);
        }
        if (filled($validated['min_mileage'] ?? null)) {
            $query->where('mileage', '>=', $validated['min_mileage']);
        }
        if (filled($validated['max_mileage'] ?? null)) {
            $query->where('mileage', '<=', $validated['max_mileage']);
        }
        foreach (['transmission', 'fuel_type', 'body_type'] as $field) {
            if (filled($validated[$field] ?? null)) {
                $query->where($field, $validated[$field]);
            }
        }
        if (filled($validated['location'] ?? null)) {
            $query->where('location', 'like', '%'.$validated['location'].'%');
        }
        if (filled($validated['region'] ?? null)) {
            $query->whereHas('showroom', fn ($q) => $q->where('region', $validated['region']));
        }

        match ($validated['sort'] ?? 'newest') {
            'price_asc' => $query->orderBy('price_amount'),
            'price_desc' => $query->orderByDesc('price_amount'),
            'year_desc' => $query->orderByDesc('year'),
            default => $query->latest('published_at')->latest('id'),
        };

        $perPage = min((int) ($validated['per_page'] ?? 20), 100);

        return (new CarCollectionResource($query->paginate($perPage)))->response();
    }

    public function show(Car $car): JsonResponse
    {
        if ($car->status !== CarStatus::Published) {
            abort(404);
        }

        $car->load(['images', 'category', 'make', 'model', 'seller.sellerProfile', 'showroom.owner.sellerProfile']);
        $car->increment('views_count');

        return $this->ok(new CarResource($car));
    }
}
