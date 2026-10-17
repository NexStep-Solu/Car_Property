<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseApiController;
use App\Http\Resources\AuditLogCollectionResource;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends BaseApiController
{
    /**
     * Paginated audit trail (action, actor name, target type filters).
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('actor:id,name,uuid')->latest('id');

        if ($request->filled('action')) {
            $query->where('action', 'like', '%'.$request->query('action').'%');
        }

        if ($request->filled('actor')) {
            $query->whereHas('actor', fn ($q) => $q->where('name', 'like', '%'.$request->query('actor').'%'));
        }

        if ($request->filled('target_type')) {
            $query->where('target_type', $request->query('target_type'));
        }

        $logs = $query->paginate(min((int) $request->input('per_page', 20), 100));

        return (new AuditLogCollectionResource($logs))->response();
    }
}
