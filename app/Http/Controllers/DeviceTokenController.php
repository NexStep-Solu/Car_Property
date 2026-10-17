<?php

namespace App\Http\Controllers;

use App\Enums\DevicePlatform;
use App\Models\DeviceToken;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DeviceTokenController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Register or refresh a push-notification device token (mobile apps).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'platform' => ['required', Rule::in(array_column(DevicePlatform::cases(), 'value'))],
            'token' => 'required|string|max:500',
        ]);

        $device = DeviceToken::updateOrCreate(
            ['user_id' => $request->user()->id, 'token' => $validated['token']],
            ['platform' => $validated['platform'], 'last_used_at' => now()]
        );

        return response()->json(['id' => $device->id], 201);
    }

    public function destroy(Request $request, DeviceToken $deviceToken)
    {
        if ($deviceToken->user_id !== $request->user()->id) {
            abort(403);
        }

        $deviceToken->delete();

        return response()->json(null, 204);
    }
}
