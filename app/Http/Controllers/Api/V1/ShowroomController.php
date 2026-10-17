<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ShowroomVerificationStatus;
use App\Http\Requests\Api\V1\Showroom\UpdateShowroomRequest;
use App\Http\Resources\ShowroomResource;
use App\Models\Showroom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShowroomController extends BaseApiController
{
    /**
     * Public showroom profile — approved showrooms only.
     */
    public function show(Showroom $showroom): JsonResponse
    {
        if ($showroom->verification_status !== ShowroomVerificationStatus::Approved) {
            abort(404);
        }

        return $this->ok(new ShowroomResource($showroom));
    }

    /**
     * The current user's showroom (owned first, then managed).
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $showroom = Showroom::where('owner_user_id', $user->id)->latest('id')->first()
            ?? Showroom::whereHas('users', fn ($q) => $q->where('users.id', $user->id)->wherePivot('is_active', true))
                ->latest('id')
                ->firstOrFail();

        return $this->ok(new ShowroomResource($showroom));
    }

    public function update(UpdateShowroomRequest $request): JsonResponse
    {
        $user = $request->user();

        $showroom = Showroom::where('owner_user_id', $user->id)->latest('id')->first()
            ?? Showroom::whereHas('users', fn ($q) => $q->where('users.id', $user->id)->wherePivot('is_active', true))
                ->latest('id')
                ->firstOrFail();

        $role = $showroom->owner_user_id === $user->id
            ? 'owner'
            : $showroom->users()->wherePivot('is_active', true)->where('users.id', $user->id)->first()?->pivot->member_role;

        if (! in_array($role, ['owner', 'manager'], true) && ! $user->hasRole('super_admin', 'admin')) {
            return $this->error('PERMISSION_DENIED', 'Only owners and managers can update the showroom.', 403);
        }

        $showroom->update($request->validated());

        return $this->ok(new ShowroomResource($showroom->fresh()));
    }
}
