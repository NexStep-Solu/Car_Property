<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseApiController;
use App\Http\Requests\Api\V1\Admin\StorePackageRequest;
use App\Http\Requests\Api\V1\Admin\UpdatePackageRequest;
use App\Http\Resources\PackageResource;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class PackageController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $packages = Package::orderBy('sort_order')->orderBy('name')->get();

        return $this->ok(PackageResource::collection($packages));
    }

    public function store(StorePackageRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['slug'] = filled($validated['slug'] ?? null)
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        $package = Package::create($validated);

        return $this->created(new PackageResource($package));
    }

    public function update(UpdatePackageRequest $request, Package $package): JsonResponse
    {
        $validated = $request->validated();

        if (array_key_exists('slug', $validated) && filled($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $package->update($validated);

        return $this->ok(new PackageResource($package->fresh()));
    }

    public function deactivate(Package $package): JsonResponse
    {
        $package->update(['is_active' => false]);

        return $this->ok(new PackageResource($package->fresh()));
    }
}
