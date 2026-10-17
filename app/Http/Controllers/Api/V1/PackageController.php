<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\PackageResource;
use App\Models\Package;
use Illuminate\Http\JsonResponse;

class PackageController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $packages = Package::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return $this->ok(PackageResource::collection($packages));
    }

    public function show(Package $package): JsonResponse
    {
        if (! $package->is_active) {
            abort(404);
        }

        return $this->ok(new PackageResource($package));
    }
}
