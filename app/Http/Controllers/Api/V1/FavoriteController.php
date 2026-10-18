<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\CarCollectionResource;
use App\Http\Resources\CarResource;
use App\Models\Car;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $cars = Car::query()
            ->join('favorites', function ($join) use ($userId) {
                $join->on('favorites.car_id', '=', 'cars.id')
                    ->where('favorites.user_id', $userId);
            })
            ->select('cars.*')
            ->with([
                'images',
                'category',
                'make',
                'model',
                'favoritedBy' => fn ($query) => $query->where('users.id', $userId),
            ])
            ->orderByDesc('favorites.id')
            ->paginate(min((int) $request->input('per_page', 20), 100));

        return (new CarCollectionResource($cars))->response();
    }

    public function store(Request $request, Car $car): JsonResponse
    {
        $favorite = Favorite::firstOrCreate([
            'user_id' => $request->user()->id,
            'car_id' => $car->id,
        ]);

        $car->load(['images', 'category', 'make', 'model']);

        // The favorite row exists by the time the resource renders, so the flag
        // can be asserted without another round trip.
        $car->setRelation('favoritedBy', collect([$request->user()->only('id')]));

        return $favorite->wasRecentlyCreated
            ? $this->created(new CarResource($car))
            : $this->ok(new CarResource($car));
    }

    public function destroy(Request $request, Car $car): JsonResponse
    {
        Favorite::where('user_id', $request->user()->id)
            ->where('car_id', $car->id)
            ->delete();

        return $this->noContent();
    }
}
