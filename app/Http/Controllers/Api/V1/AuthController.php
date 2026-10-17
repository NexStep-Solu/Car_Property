<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AuthController extends BaseApiController
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'preferred_language' => $validated['preferred_language'] ?? 'en',
            'is_admin_account' => false,
            'account_status' => 'active',
        ]);

        $buyerRole = Role::firstOrCreate(
            ['name' => 'buyer', 'guard_name' => 'web'],
            ['name' => 'buyer', 'guard_name' => 'web']
        );
        $user->assignRole($buyerRole);

        $token = $user->createToken($request->input('device_name', 'api'))->plainTextToken;

        return $this->created([
            'user' => new UserResource($user->load(['roles', 'sellerProfile'])),
            'token' => $token,
        ]);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = isset($validated['email'])
            ? User::where('email', $validated['email'])->first()
            : User::where('phone', $validated['phone'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return $this->error('INVALID_CREDENTIALS', 'The provided credentials are incorrect.', 401);
        }

        if ($user->account_status !== 'active') {
            return $this->error('ACCOUNT_SUSPENDED', 'This account is '.$user->account_status.'.', 403);
        }

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        $token = $user->createToken($validated['device_name'] ?? 'api')->plainTextToken;

        return $this->ok([
            'user' => new UserResource($user->load(['roles', 'sellerProfile'])),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->noContent();
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['roles', 'sellerProfile', 'showrooms']);

        return $this->ok([
            'user' => new UserResource($user),
            'showrooms' => $user->showrooms,
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->currentAccessToken()->delete();

        $token = $user->createToken($request->input('device_name', 'api'))->plainTextToken;

        return $this->ok([
            'user' => new UserResource($user->load(['roles', 'sellerProfile'])),
            'token' => $token,
        ]);
    }
}
