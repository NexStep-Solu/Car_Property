<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseApiController;
use App\Http\Requests\Api\V1\Admin\UpdateUserStatusRequest;
use App\Http\Resources\UserCollectionResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends BaseApiController
{
    /**
     * Search users (name/email/phone, status, admin accounts).
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles')->latest('id');

        if ($request->filled('q')) {
            $q = $request->query('q');

            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', '%'.$q.'%')
                    ->orWhere('email', 'like', '%'.$q.'%')
                    ->orWhere('phone', 'like', '%'.$q.'%');
            });
        }

        if ($request->filled('status')) {
            $query->where('account_status', $request->query('status'));
        }

        if ($request->has('is_admin_account')) {
            $query->where('is_admin_account', $request->boolean('is_admin_account'));
        }

        $users = $query->paginate(min((int) $request->input('per_page', 20), 100));

        return (new UserCollectionResource($users))->response();
    }

    /**
     * User detail.
     */
    public function show(User $user): JsonResponse
    {
        $user->load('roles', 'sellerProfile');

        return $this->ok(new UserResource($user));
    }

    /**
     * Suspend / reactivate / close a user account.
     */
    public function updateStatus(UpdateUserStatusRequest $request, User $user): JsonResponse
    {
        if ($request->user()->is($user)) {
            return $this->error(
                'VALIDATION_ERROR',
                'You cannot change your own account status.',
                422
            );
        }

        $validated = $request->validated();
        $previous = $user->account_status;

        $user->update(['account_status' => $validated['status']]);

        AuditLogger::log('user.status_changed', $user, $validated['reason'] ?? null, [
            'from' => $previous,
            'to' => $validated['status'],
        ]);

        $user->load('roles', 'sellerProfile');

        return $this->ok(new UserResource($user));
    }
}
