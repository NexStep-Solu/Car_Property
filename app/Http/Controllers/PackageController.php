<?php

namespace App\Http\Controllers;

use App\Enums\ExpiredAdsAction;
use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PackageController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected function ensureSuperAdmin(User $user): void
    {
        if (! $user->hasRole('super_admin', 'admin')) {
            abort(403, 'Only Super Admins can manage packages.');
        }
    }

    public function index(Request $request)
    {
        $this->ensureSuperAdmin($request->user());

        return Inertia::render('Packages/Index', [
            'packages' => Package::orderBy('sort_order')->orderBy('name')->paginate(10),
            'expiredAdsActions' => array_column(ExpiredAdsAction::cases(), 'value'),
        ]);
    }

    public function create(Request $request)
    {
        $this->ensureSuperAdmin($request->user());

        return Inertia::render('Packages/Create', [
            'expiredAdsActions' => array_column(ExpiredAdsAction::cases(), 'value'),
        ]);
    }

    protected function rules(?Package $package = null): array
    {
        return [
            'name' => 'required|string|max:100',
            'slug' => ['nullable', 'string', 'max:120', Rule::unique('packages', 'slug')->ignore($package?->id)],
            'description' => 'nullable|string',
            'price_amount' => 'required|integer|min:0',
            'currency' => 'required|string|size:3',
            'duration_days' => 'required|integer|min:1',
            'active_listing_limit' => 'required|integer|min:0',
            'featured_ads_limit' => 'nullable|integer|min:0',
            'features_json' => 'nullable|array',
            'expired_ads_action' => ['required', Rule::in(array_column(ExpiredAdsAction::cases(), 'value'))],
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ];
    }

    public function store(Request $request)
    {
        $this->ensureSuperAdmin($request->user());

        $validated = $request->validate($this->rules());
        $validated['slug'] = filled($validated['slug'] ?? null)
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        $package = Package::create($validated);

        return redirect()->route('packages.index')->with('success', 'Package created.');
    }

    public function edit(Request $request, Package $package)
    {
        $this->ensureSuperAdmin($request->user());

        return Inertia::render('Packages/Edit', [
            'package' => $package,
            'expiredAdsActions' => array_column(ExpiredAdsAction::cases(), 'value'),
        ]);
    }

    public function update(Request $request, Package $package)
    {
        $this->ensureSuperAdmin($request->user());

        $validated = $request->validate($this->rules($package));

        if (filled($validated['slug'] ?? null)) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $package->update($validated);

        return redirect()->route('packages.index')->with('success', 'Package updated.');
    }

    public function destroy(Request $request, Package $package)
    {
        $this->ensureSuperAdmin($request->user());

        if ($package->subscriptions()->where('status', 'active')->exists()) {
            return back()->withErrors(['package' => 'Cannot delete a package with active subscriptions.']);
        }

        $package->delete();

        return redirect()->route('packages.index')->with('success', 'Package deleted.');
    }
}
