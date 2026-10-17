<?php

namespace App\Http\Controllers;

use App\Enums\CarCondition;
use App\Enums\CarStatus;
use App\Enums\ReportReason;
use App\Enums\FuelType;
use App\Enums\TransmissionType;
use App\Models\Car;
use App\Models\CarMake;
use App\Models\CarModel;
use App\Models\Showroom;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CarController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected function isPlatformAdmin(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'reviewer', 'support'], 'admin');
    }

    protected function canReview(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'reviewer'], 'admin');
    }

    protected function isOwner(User $user, Car $car): bool
    {
        if ($car->seller_user_id && (int) $car->seller_user_id === $user->id) {
            return true;
        }

        return $car->showroom_id
            && Showroom::where('id', $car->showroom_id)->where('owner_user_id', $user->id)->exists();
    }

    protected function showroomRole(User $user, ?int $showroomId): ?string
    {
        if (! $showroomId) {
            return null;
        }

        $showroom = Showroom::find($showroomId);
        if (! $showroom) {
            return null;
        }

        if ($showroom->owner_user_id === $user->id) {
            return 'owner';
        }

        return $showroom->users()->wherePivot('is_active', true)->where('users.id', $user->id)->first()?->pivot->member_role;
    }

    protected function canManage(User $user, Car $car): bool
    {
        if ($this->isPlatformAdmin($user) || $this->isOwner($user, $car)) {
            return true;
        }

        return in_array($this->showroomRole($user, $car->showroom_id), ['owner', 'manager'], true);
    }

    /**
     * Showrooms the user may list cars under.
     */
    protected function listableShowrooms(User $user)
    {
        if ($this->isPlatformAdmin($user)) {
            return Showroom::orderBy('business_name')->get(['id', 'business_name']);
        }

        $owned = Showroom::where('owner_user_id', $user->id);
        $member = Showroom::whereHas('users', fn ($q) => $q->where('users.id', $user->id)->wherePivot('is_active', true));

        return $owned->union($member)->orderBy('business_name')->get(['id', 'business_name']);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = Car::with(['make:id,name', 'model:id,name', 'showroom:id,business_name', 'seller:id,name'])
            ->latest();

        // Non-reviewers see published cars plus their own listings.
        if (! $this->canReview($user) && ! $user->hasRole('super_admin', 'admin')) {
            $showroomIds = $this->listableShowrooms($user)->pluck('id')->all();
            $query->where(function ($q) use ($user, $showroomIds) {
                $q->where('status', CarStatus::Published->value)
                    ->orWhere('seller_user_id', $user->id)
                    ->orWhereIn('showroom_id', $showroomIds);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->filled('make_id')) {
            $query->where('make_id', $request->query('make_id'));
        }
        if ($request->filled('search')) {
            $search = '%'.$request->query('search').'%';
            $query->where(fn ($q) => $q->where('title', 'like', $search)->orWhere('location', 'like', $search));
        }

        return Inertia::render('Cars/Index', [
            'cars' => $query->paginate(12)->withQueryString(),
            'filters' => $request->only(['status', 'make_id', 'search']),
            'statuses' => array_column(CarStatus::cases(), 'value'),
            'makes' => CarMake::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'canReview' => $this->canReview($user),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('Cars/Create', [
            'makes' => CarMake::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'models' => CarModel::where('is_active', true)->orderBy('name')->get(['id', 'make_id', 'name']),
            'categories' => \App\Models\CarCategory::where('is_active', true)->orderBy('sort_order')->orderBy('name')->get(['id', 'name']),
            'showrooms' => $this->listableShowrooms($request->user()),
            'conditions' => array_column(CarCondition::cases(), 'value'),
            'transmissions' => array_column(TransmissionType::cases(), 'value'),
            'fuels' => array_column(FuelType::cases(), 'value'),
        ]);
    }

    protected function baseRules(?Car $car = null): array
    {
        return [
            'make_id' => 'nullable|exists:car_makes,id',
            'model_id' => 'nullable|exists:car_models,id',
            'category_id' => 'nullable|exists:car_categories,id',
            'make_text' => 'nullable|string|max:100',
            'model_text' => 'nullable|string|max:100',
            'title' => 'required|string|max:180',
            'year' => 'required|integer|between:1950,2100',
            'price_amount' => 'required|integer|min:0',
            'currency' => 'required|string|size:3',
            'mileage' => 'nullable|integer|min:0',
            'transmission' => ['nullable', Rule::in(array_column(TransmissionType::cases(), 'value'))],
            'fuel_type' => ['nullable', Rule::in(array_column(FuelType::cases(), 'value'))],
            'body_type' => 'nullable|string|max:40',
            'color' => 'nullable|string|max:40',
            'location' => 'required|string|max:180',
            'description' => 'nullable|string',
            'condition' => ['required', Rule::in(array_column(CarCondition::cases(), 'value'))],
            'is_featured' => 'nullable|boolean',
        ];
    }

    /**
     * Exactly one of seller_user_id / showroom_id (mirrors the DB check).
     */
    protected function resolveListingOwner(Request $request, array $validated): array
    {
        $user = $request->user();
        $sellerId = $validated['seller_user_id'] ?? null;
        $showroomId = $validated['showroom_id'] ?? null;

        if (filled($sellerId) === filled($showroomId)) {
            abort(422, 'A car must be listed either as yourself or under exactly one showroom.');
        }

        if (filled($showroomId)) {
            $showroom = Showroom::findOrFail($showroomId);
            $role = $this->showroomRole($user, $showroom->id);

            if (! $user->hasRole('super_admin', 'admin')
                && $showroom->owner_user_id !== $user->id
                && ! in_array($role, ['owner', 'manager'], true)) {
                abort(403, 'You cannot list cars under this showroom.');
            }
            $validated['showroom_id'] = $showroom->id;
            unset($validated['seller_user_id']);
        } else {
            $validated['seller_user_id'] = $user->id;
            unset($validated['showroom_id']);
        }

        return $validated;
    }

    public function store(Request $request)
    {
        $validated = $request->validate(array_merge($this->baseRules(), [
            'seller_user_id' => 'nullable|exists:users,id',
            'showroom_id' => 'nullable|exists:showrooms,id',
        ]));

        $validated = $this->resolveListingOwner($request, $validated);
        $validated['status'] = CarStatus::Draft->value;

        // Only reviewers may feature a listing.
        if (empty($validated['is_featured']) || ! $this->canReview($request->user())) {
            $validated['is_featured'] = false;
        }

        $car = Car::create($validated);
        $car->statusHistory()->create([
            'from_status' => null,
            'to_status' => CarStatus::Draft->value,
            'changed_by' => $request->user()->id,
        ]);

        return redirect()->route('cars.show', $car)->with('success', 'Car listed successfully.');
    }

    public function show(Request $request, Car $car)
    {
        $user = $request->user();

        if ($car->status !== CarStatus::Published && ! $this->canManage($user, $car)) {
            abort(403, 'You do not have permission to view this car.');
        }

        // Count views on published listings seen by others.
        if ($car->status === CarStatus::Published && ! $this->isOwner($user, $car)) {
            $car->increment('views_count');
        }

        $car->load(['make:id,name', 'model:id,name', 'category:id,name', 'showroom:id,business_name,slug', 'seller:id,name', 'reviewer:id,name', 'images', 'statusHistory.changer:id,name']);

        return Inertia::render('Cars/Show', [
            'car' => $car,
            'canManage' => $this->canManage($user, $car),
            'canReview' => $this->canReview($user),
            'statuses' => array_column(CarStatus::cases(), 'value'),
            'reportReasons' => array_column(ReportReason::cases(), 'value'),
        ]);
    }

    public function edit(Request $request, Car $car)
    {
        if (! $this->canManage($request->user(), $car)) {
            abort(403, 'You do not have permission to edit this car.');
        }

        return Inertia::render('Cars/Edit', [
            'car' => $car,
            'makes' => CarMake::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'models' => CarModel::where('is_active', true)->orderBy('name')->get(['id', 'make_id', 'name']),
            'categories' => \App\Models\CarCategory::where('is_active', true)->orderBy('sort_order')->orderBy('name')->get(['id', 'name']),
            'conditions' => array_column(CarCondition::cases(), 'value'),
            'transmissions' => array_column(TransmissionType::cases(), 'value'),
            'fuels' => array_column(FuelType::cases(), 'value'),
        ]);
    }

    public function update(Request $request, Car $car)
    {
        if (! $this->canManage($request->user(), $car)) {
            abort(403, 'You do not have permission to edit this car.');
        }

        if (! in_array($car->status, [CarStatus::Draft, CarStatus::ChangesRequested], true)
            && ! $request->user()->hasRole('super_admin', 'admin')) {
            abort(403, 'Only draft listings can be edited.');
        }

        $validated = $request->validate($this->baseRules($car));

        if (! $this->canReview($request->user())) {
            unset($validated['is_featured']);
        }

        $car->update($validated);

        return redirect()->route('cars.show', $car)->with('success', 'Car updated successfully.');
    }

    public function destroy(Request $request, Car $car)
    {
        $user = $request->user();

        if (! $this->isOwner($user, $car) && ! $user->hasRole('super_admin', 'admin')) {
            abort(403, 'Only the owner can delete this car.');
        }

        $car->delete();

        return redirect()->route('cars.index')->with('success', 'Car deleted successfully.');
    }

    /**
     * Status transitions with history + showroom/reviewer bookkeeping.
     */
    public function updateStatus(Request $request, Car $car)
    {
        $user = $request->user();
        $isReviewer = $this->canReview($user);
        $isManager = $this->canManage($user, $car);

        $validated = $request->validate([
            'status' => ['required', Rule::in(array_column(CarStatus::cases(), 'value'))],
            'reason' => 'nullable|string',
        ]);

        $to = $validated['status'];

        $reviewerActions = [CarStatus::Published->value, CarStatus::Rejected->value, CarStatus::ChangesRequested->value, CarStatus::Suspended->value, CarStatus::Expired->value];        $ownerActions = [CarStatus::Draft->value, CarStatus::PendingReview->value, CarStatus::Sold->value, CarStatus::Archived->value];

        if (in_array($to, $reviewerActions, true) && ! $isReviewer) {
            abort(403, 'Only reviewers can make this transition.');
        }
        if (in_array($to, $ownerActions, true) && ! $isManager) {
            abort(403, 'You do not have permission for this transition.');
        }

        $update = ['status' => $to];
        if ($isReviewer) {
            $update['reviewed_by'] = $user->id;
            $update['reviewed_at'] = now();
        }
        if (array_key_exists('reason', $validated)) {
            $update['review_reason'] = $validated['reason'];
        }
        if ($to === CarStatus::Published->value) {
            $update['published_at'] = $car->published_at ?? now();
            $update['sold_at'] = null;
        }
        if ($to === CarStatus::Sold->value) {
            $update['sold_at'] = now();
        }

        \App\Observers\CarObserver::setChangeReason($car, $validated['reason'] ?? null);
        $car->update($update);

        // History + audit are written by CarObserver (it picks up the
        // transient reason below).

        return redirect()->route('cars.show', $car)->with('success', 'Status updated.');
    }

    public function uploadImage(Request $request, Car $car)
    {
        if (! $this->canManage($request->user(), $car)) {
            abort(403, 'You do not have permission to manage images.');
        }

        $validated = $request->validate([
            'image' => 'required|file|max:10240|mimes:jpg,jpeg,png,webp',
            'alt_text' => 'nullable|string|max:180',
        ]);

        $file = $request->file('image');
        $isFirst = ! $car->images()->exists();

        $image = $car->images()->create([
            'storage_key' => $file->store('car-images', 'public'),
            'public_url' => null,
            'alt_text' => $validated['alt_text'] ?? null,
            'sort_order' => (int) $car->images()->max('sort_order') + 1,
            'is_primary' => $isFirst,
        ]);

        return redirect()->route('cars.show', $car)->with('success', 'Image uploaded.');
    }

    public function destroyImage(Request $request, Car $car, int $imageId)
    {
        if (! $this->canManage($request->user(), $car)) {
            abort(403, 'You do not have permission to manage images.');
        }

        $image = $car->images()->whereKey($imageId)->firstOrFail();
        $wasPrimary = $image->is_primary;

        Storage::disk('public')->delete($image->storage_key);
        $image->delete();

        if ($wasPrimary) {
            $car->images()->orderBy('sort_order')->first()?->update(['is_primary' => true]);
        }

        return redirect()->route('cars.show', $car)->with('success', 'Image deleted.');
    }

    public function setPrimaryImage(Request $request, Car $car, int $imageId)
    {
        if (! $this->canManage($request->user(), $car)) {
            abort(403, 'You do not have permission to manage images.');
        }

        $image = $car->images()->whereKey($imageId)->firstOrFail();

        $car->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return redirect()->route('cars.show', $car)->with('success', 'Primary image updated.');
    }
}
