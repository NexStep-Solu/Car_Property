<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\CarCategoryResource;
use App\Models\CarCategory;
use App\Models\CarMake;
use App\Models\CarModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarMetaController extends BaseApiController
{
    public function makes(): JsonResponse
    {
        return $this->ok(CarMake::where('is_active', true)->orderBy('name')->get(['id', 'name']));
    }

    public function models(Request $request): JsonResponse
    {
        $request->validate(['make_id' => 'nullable|integer|exists:car_makes,id']);

        $query = CarModel::where('is_active', true)->orderBy('name');

        if ($request->filled('make_id')) {
            $query->where('make_id', $request->query('make_id'));
        }

        return $this->ok($query->get(['id', 'make_id', 'name']));
    }

    public function categories(): JsonResponse
    {
        return $this->ok(CarCategoryResource::collection(
            CarCategory::where('is_active', true)->orderBy('sort_order')->orderBy('name')->get()
        ));
    }
}
