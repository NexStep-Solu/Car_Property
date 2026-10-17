<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\NotificationCollectionResource;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends BaseApiController
{
    /**
     * The current user's notifications, newest first.
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest('id')
            ->paginate(min((int) $request->input('per_page', 20), 100));

        return (new NotificationCollectionResource($notifications))->response();
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return $this->error(
                'PERMISSION_DENIED',
                'You do not have permission to manage this notification.',
                403
            );
        }

        $notification->markRead();

        return $this->ok(new NotificationResource($notification));
    }

    /**
     * Mark all of the current user's notifications as read.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->noContent();
    }
}
