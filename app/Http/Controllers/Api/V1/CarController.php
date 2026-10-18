<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CarStatus;
use App\Http\Requests\Api\V1\Car\IndexCarRequest;
use App\Http\Resources\CarCollectionResource;
use App\Http\Resources\CarResource;
use App\Models\Car;
use App\Models\CarCategory;
use App\Models\CarMake;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class CarController extends BaseApiController
{
    public function index(IndexCarRequest $request): JsonResponse
    {
        $this->authenticateSanctum($request);

        $validated = $request->validated();

        $query = Car::query()
            ->where('status', CarStatus::Published->value)
            ->with(['images', 'category', 'make', 'model', 'seller.sellerProfile', 'showroom.owner.sellerProfile'])
            ->with($this->favoritesScope($request));

        if (filled($validated['q'] ?? null)) {
            $search = '%'.$validated['q'].'%';
            $query->where(fn ($q) => $q->where('title', 'like', $search)->orWhere('description', 'like', $search));
        }
        foreach (['make_id', 'model_id', 'category_id'] as $field) {
            if (filled($validated[$field] ?? null)) {
                $query->where($field, $validated[$field]);
            }
        }
        // `make` matches the resolved make name, because listings are either
        // linked to the catalogue or carry a free-text make. This is what the
        // `GET /cars/filters` facet list reports, so the two stay consistent.
        if (filled($validated['make'] ?? null)) {
            $make = mb_strtolower($validated['make']);
            $query->where(function ($q) use ($make) {
                $q->whereRaw('LOWER(cars.make_text) = ?', [$make])
                    ->orWhereHas('make', fn ($mq) => $mq->whereRaw('LOWER(car_makes.name) = ?', [$make]));
            });
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
        foreach (['transmission', 'fuel_type', 'body_type', 'condition'] as $field) {
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
        if (array_key_exists('featured', $validated) && $validated['featured'] !== null) {
            $query->where('is_featured', $request->boolean('featured'));
        }

        match ($validated['sort'] ?? 'newest') {
            'price_asc' => $query->orderBy('price_amount'),
            'price_desc' => $query->orderByDesc('price_amount'),
            'mileage_asc' => $query->orderBy('mileage'),
            'year_desc' => $query->orderByDesc('year'),
            default => $query->latest('published_at')->latest('id'),
        };

        $perPage = min((int) ($validated['per_page'] ?? 20), 100);

        return (new CarCollectionResource($query->paginate($perPage)))->response();
    }

    /**
     * Facet counts and bounds used to build the client's filter sheet.
     *
     * Counts are computed over the published catalogue rather than the current
     * result set, so the available options stay stable while the user narrows
     * the search.
     */
    public function filters(): JsonResponse
    {
        // A fresh builder per facet: Eloquent builders are mutable, so sharing
        // one instance across the aggregated selects would accumulate them.
        $facet = function (string $column): array {
            // `condition` is reserved in MySQL, so let the grammar quote it.
            $wrapped = $this->publishedCars()->getQuery()->getGrammar()->wrap('cars.'.$column);

            return $this->publishedCars()
                ->selectRaw("$wrapped as value")
                ->selectRaw('COUNT(*) as count')
                ->whereNotNull($column)
                ->groupBy($column)
                ->orderByDesc('count')
                ->get()
                ->map(fn ($row) => [
                    'value' => (string) $row->value,
                    'label' => (string) $row->value,
                    'count' => (int) $row->count,
                ])
                ->values()
                ->all();
        };

        $bounds = $this->publishedCars()
            ->selectRaw('MIN(price_amount) as min_price, MAX(price_amount) as max_price')
            ->selectRaw('MIN(year) as min_year, MAX(year) as max_year')
            ->first();

        $currency = (string) ($this->publishedCars()->whereNotNull('currency')->value('currency') ?? 'USD');

        return $this->ok([
            'makes' => $this->makeFacets(),
            'categories' => $this->categoryFacets(),
            'body_types' => $facet('body_type'),
            'fuel_types' => $facet('fuel_type'),
            'transmissions' => $facet('transmission'),
            'conditions' => $facet('condition'),
            'price' => [
                'min' => (int) ($bounds->min_price ?? 0),
                'max' => (int) ($bounds->max_price ?? 0),
                'currency' => $currency,
            ],
            'year' => [
                'min' => (int) ($bounds->min_year ?? 0),
                'max' => (int) ($bounds->max_year ?? 0),
            ],
        ]);
    }

    /** Query over the public catalogue. */
    private function publishedCars(): Builder
    {
        return Car::query()->where('status', CarStatus::Published->value);
    }

    /**
     * Makes are free-text on listings, so the facet unions the catalogue table
     * with the denormalised text values and filters each by its own key.
     */
    private function makeFacets(): array
    {
        $catalog = CarMake::query()
            ->select('car_makes.name as value')
            ->selectRaw('COUNT(*) as count')
            ->join('cars', function ($join) {
                $join->on('cars.make_id', '=', 'car_makes.id')
                    ->where('cars.status', CarStatus::Published->value);
            })
            ->groupBy('car_makes.name')
            ->pluck('count', 'value');

        $freeText = $this->publishedCars()
            ->whereNotNull('make_text')
            ->whereNull('make_id')
            ->select('make_text as value')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('make_text')
            ->pluck('count', 'value');

        return collect($catalog->all())
            ->merge($freeText->all())
            ->map(fn ($count, $name) => [
                'value' => (string) $name,
                'label' => (string) $name,
                'count' => (int) $count,
            ])
            ->sortByDesc('count')
            ->values()
            ->all();
    }

    /** @return list<array{value: string, label: string, count: int, slug: string|null}> */
    private function categoryFacets(): array
    {
        return CarCategory::query()
            ->select('name', 'slug')
            ->selectRaw('COUNT(cars.id) as count')
            ->join('cars', function ($join) {
                $join->on('cars.category_id', '=', 'car_categories.id')
                    ->where('cars.status', CarStatus::Published->value);
            })
            ->groupBy('car_categories.id', 'car_categories.name', 'car_categories.slug')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'value' => (string) $row->slug,
                'label' => (string) $row->name,
                'count' => (int) $row->count,
                'slug' => (string) $row->slug,
            ])
            ->all();
    }

    public function show(Car $car): JsonResponse
    {
        $this->authenticateSanctum(request());

        if ($car->status !== CarStatus::Published) {
            abort(404);
        }

        $car->load(['images', 'category', 'make', 'model', 'seller.sellerProfile', 'showroom.owner.sellerProfile']);
        $car->load($this->favoritesScope(request()));
        $car->increment('views_count');

        return $this->ok(new CarResource($car));
    }

    /**
     * Constrains the `favoritedBy` eager load to the current user so listing
     * endpoints report the favorite flag without an N+1 query.
     */
    private function favoritesScope(Request $request): array
    {
        $user = $request->user();

        return $user === null
            ? []
            : ['favoritedBy' => fn ($query) => $query->where('users.id', $user->id)];
    }

    /**
     * Authenticate via Sanctum when a bearer token is present, even on public
     * routes. This lets the `/cars` endpoints report the `favorited` flag for
     * signed-in users without requiring `auth:sanctum` middleware (which would
     * block unauthenticated guest browsing).
     */
    private function authenticateSanctum(Request $request): void
    {
        if ($request->user()) {
            return;
        }

        $token = $request->bearerToken();
        if (!$token) {
            return;
        }

        $accessToken = PersonalAccessToken::findToken($token);
        if ($accessToken) {
            $request->setUserResolver(function () use ($accessToken) {
                return $accessToken->tokenable;
            });
        }
    }
}
