<?php

namespace App\Http\Controllers;

use App\Enums\ReportReason;
use App\Enums\ReportStatus;
use App\Models\Notification;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ReportController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected function canHandle(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'reviewer', 'support'], 'admin');
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = Report::with(['reporter:id,name', 'handler:id,name'])->latest();

        if (! $this->canHandle($user)) {
            $query->where('reporter_user_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        return Inertia::render('Reports/Index', [
            'reports' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['status']),
            'statuses' => array_column(ReportStatus::cases(), 'value'),
            'canHandle' => $this->canHandle($user),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'target_type' => ['required', Rule::in(['car', 'user', 'showroom'])],
            'target_id' => 'required|integer|min:1',
            'reason' => ['required', Rule::in(array_column(ReportReason::cases(), 'value'))],
            'description' => 'nullable|string',
        ]);

        // Target must exist.
        $modelClass = Relation::getMorphedModel($validated['target_type']);
        if (! $modelClass || ! $modelClass::whereKey($validated['target_id'])->exists()) {
            return back()->withErrors(['target_id' => 'The reported item does not exist.']);
        }

        $report = Report::create([
            ...$validated,
            'reporter_user_id' => $request->user()->id,
            'status' => ReportStatus::Open->value,
        ]);

        return redirect()->route('reports.show', $report)->with('success', 'Report submitted. Our team will review it.');
    }

    public function show(Request $request, Report $report)
    {
        $user = $request->user();

        if ($report->reporter_user_id !== $user->id && ! $this->canHandle($user)) {
            abort(403, 'You do not have permission to view this report.');
        }

        $report->load(['reporter:id,name,email', 'handler:id,name', 'target']);

        return Inertia::render('Reports/Show', [
            'report' => [
                ...$report->toArray(),
                'target_label' => $this->targetLabel($report),
            ],
            'canHandle' => $this->canHandle($user),
            'statuses' => array_column(ReportStatus::cases(), 'value'),
        ]);
    }

    public function destroy(Request $request, Report $report)
    {
        $user = $request->user();

        $isOwnOpen = $report->reporter_user_id === $user->id
            && $report->status === ReportStatus::Open;

        if (! $isOwnOpen && ! $user->hasRole('super_admin', 'admin')) {
            abort(403, 'Only open reports can be deleted.');
        }

        $report->delete();

        return redirect()->route('reports.index')->with('success', 'Report deleted.');
    }

    /**
     * Handler triage: reviewing / resolved / dismissed.
     */
    public function handle(Request $request, Report $report)
    {
        if (! $this->canHandle($request->user())) {
            abort(403, 'You do not have permission to handle reports.');
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in([
                ReportStatus::Reviewing->value,
                ReportStatus::Resolved->value,
                ReportStatus::Dismissed->value,
            ])],
        ]);

        $report->update([
            'status' => $validated['status'],
            'handled_by' => $request->user()->id,
            'resolved_at' => in_array($validated['status'], [ReportStatus::Resolved->value, ReportStatus::Dismissed->value], true)
                ? now()
                : null,
        ]);

        // Notify the reporter on final decisions.
        if ($report->reporter_user_id && in_array($validated['status'], [ReportStatus::Resolved->value, ReportStatus::Dismissed->value], true)) {
            Notification::pushTo(
                $report->reporter,
                'report.'.$validated['status'],
                'Your report was '.$validated['status'],
                "Report #{$report->id} regarding {$report->target_type} has been {$validated['status']}.",
                ['report_id' => $report->id, 'status' => $validated['status']]
            );
        }

        return redirect()->route('reports.show', $report)->with('success', 'Report updated.');
    }

    protected function targetLabel(Report $report): string
    {
        $target = $report->target;

        if (! $target) {
            return "{$report->target_type} #{$report->target_id} (removed)";
        }

        return match ($report->target_type) {
            'car' => $target->title ?? "Car #{$target->getKey()}",
            'showroom' => $target->business_name ?? "Showroom #{$target->getKey()}",
            default => ($target->name ?? 'User')." #{$target->getKey()}",
        };
    }
}
