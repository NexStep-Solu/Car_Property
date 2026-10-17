<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected function canView(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'support'], 'admin');
    }

    public function index(Request $request)
    {
        if (! $this->canView($request->user())) {
            abort(403, 'You do not have permission to view audit logs.');
        }

        $query = AuditLog::with('actor:id,name')->latest('id');

        if ($request->filled('action')) {
            $query->where('action', 'like', '%'.$request->query('action').'%');
        }
        if ($request->filled('actor')) {
            $query->whereHas('actor', fn ($q) => $q->where('name', 'like', '%'.$request->query('actor').'%'));
        }

        return Inertia::render('AuditLogs/Index', [
            'logs' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['action', 'actor']),
        ]);
    }
}
