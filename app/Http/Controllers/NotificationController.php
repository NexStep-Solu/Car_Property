<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    public function index(Request $request)
    {
        return Inertia::render('Notifications/Index', [
            'notifications' => Notification::where('user_id', $request->user()->id)
                ->latest('id')
                ->paginate(15),
            'unreadCount' => Notification::where('user_id', $request->user()->id)
                ->whereNull('read_at')
                ->count(),
        ]);
    }

    public function read(Request $request, Notification $notification)
    {
        $this->ensureOwn($request->user(), $notification);

        $notification->markRead();

        return back()->with('success', 'Marked as read.');
    }

    public function readAll(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return back()->with('success', 'All notifications marked as read.');
    }

    public function destroy(Request $request, Notification $notification)
    {
        $this->ensureOwn($request->user(), $notification);

        $notification->delete();

        return back()->with('success', 'Notification deleted.');
    }

    protected function ensureOwn(User $user, Notification $notification): void
    {
        if ($notification->user_id !== $user->id) {
            abort(403, 'You do not have permission to manage this notification.');
        }
    }
}
