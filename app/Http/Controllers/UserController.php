<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    public function index()
    {
        $users = User::with('roles')->latest()->paginate(10);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => Role::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $this->syncRolesAcrossGuards($user, $validated['roles'] ?? []);

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function show(User $user)
    {
        $user->load('roles');

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $user->load('roles');

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => Role::all(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            ...(filled($validated['password'] ?? null) ? ['password' => Hash::make($validated['password'])] : []),
        ]);

        if (isset($validated['roles'])) {
            $this->syncRolesAcrossGuards($user, $validated['roles']);
        }

        return redirect()->route('users.show', $user)->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    /**
     * Sync roles spanning the web + admin guards.
     *
     * Spatie's syncRoles() throws GuardDoesNotMatch for roles outside the
     * model's (web) guard, so web roles go through syncRoles() while
     * admin-guard roles are attached/detached on the relation directly
     * (identical pivot rows, null team for platform-global assignments).
     */
    protected function syncRolesAcrossGuards(User $user, array $roleIds): void
    {
        $roles = Role::whereIn('id', $roleIds)->get();

        $user->syncRoles($roles->where('guard_name', 'web'));

        $wantedAdminIds = $roles->where('guard_name', 'admin')->pluck('id')->all();
        $currentAdminIds = $user->roles()->get()->where('guard_name', 'admin')->pluck('id')->all();

        $user->roles()->detach(array_diff($currentAdminIds, $wantedAdminIds));
        $user->roles()->syncWithoutDetaching(array_diff($wantedAdminIds, $currentAdminIds));
    }
}
