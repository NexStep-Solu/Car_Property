<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SettingController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * System settings are Super Admin only.
     */
    protected function ensureSuperAdmin(User $user): void
    {
        if (! $user->hasRole('super_admin', 'admin')) {
            abort(403, 'Only Super Admins can manage system settings.');
        }
    }

    public function index(Request $request)
    {
        $this->ensureSuperAdmin($request->user());

        return Inertia::render('SystemSettings/Index', [
            'settings' => Setting::orderBy('group')->orderBy('key')->get(),
            'groups' => ['general', 'documents', 'listings', 'payments', 'notifications'],
            'types' => ['string', 'int', 'bool', 'json'],
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureSuperAdmin($request->user());

        $validated = $request->validate([
            'key' => 'required|string|max:100|unique:settings,key|regex:/^[a-z0-9_.]+$/',
            'value' => 'nullable',
            'group' => ['required', Rule::in(['general', 'documents', 'listings', 'payments', 'notifications'])],
            'type' => ['required', Rule::in(['string', 'int', 'bool', 'json'])],
        ]);

        if ($validated['type'] === 'json' && filled($validated['value'] ?? null) && ! is_string($validated['value'])) {
            $validated['value'] = json_encode($validated['value']);
        }

        Setting::create([
            'key' => $validated['key'],
            'value' => isset($validated['value']) ? $this->coerceForStorage($validated['value'], $validated['type']) : null,
            'group' => $validated['group'],
            'type' => $validated['type'],
        ]);

        return redirect()->route('admin.settings.index')->with('success', 'Setting created.');
    }

    public function update(Request $request, Setting $setting)
    {
        $this->ensureSuperAdmin($request->user());

        $validated = $request->validate([
            'value' => 'nullable',
            'group' => ['sometimes', Rule::in(['general', 'documents', 'listings', 'payments', 'notifications'])],
            'type' => ['sometimes', Rule::in(['string', 'int', 'bool', 'json'])],
        ]);

        // Keep stored raw values consistent with the (possibly new) type.
        $type = $validated['type'] ?? $setting->type;
        if (array_key_exists('value', $validated)) {
            $validated['value'] = $this->coerceForStorage($validated['value'], $type);
        }

        $setting->update($validated);

        return redirect()->route('admin.settings.index')->with('success', 'Setting updated.');
    }

    public function destroy(Request $request, Setting $setting)
    {
        $this->ensureSuperAdmin($request->user());

        $setting->delete();

        return redirect()->route('admin.settings.index')->with('success', 'Setting deleted.');
    }

    protected function coerceForStorage(mixed $value, string $type): ?string
    {
        if ($value === null || $value === '') {
            return $type === 'string' ? (string) $value : null;
        }

        return match ($type) {
            'int' => (string) (int) $value,
            'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
            'json' => is_string($value) ? $value : json_encode($value),
            default => (string) $value,
        };
    }
}
