<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $employees = Employee::with(['user', 'department'])
            ->when($request->search, function ($query) use ($request) {
                $query->whereHas('user', function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('email', 'like', '%' . $request->search . '%');
                });
            })
            ->when($request->department_id, function ($query) use ($request) {
                $query->where('department_id', $request->department_id);
            })
            ->when($request->status, function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        $departments = Department::orderBy('name')->get();

        return Inertia::render('Employee/Index', [
            'employees' => $employees,
            'departments' => $departments,
            'filters' => $request->only(['search', 'department_id', 'status', 'per_page']),
        ]);
    }

    public function create()
    {
        $departments = Department::orderBy('name')->get();
        $users = User::whereDoesntHave('employee')->orderBy('name')->get();

        return Inertia::render('Employee/Create', [
            'departments' => $departments,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:employees,user_id',
            'employee_id' => 'nullable|string|max:50|unique:employees,employee_id',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'hire_date' => 'required|date',
            'position' => 'required|string|max:100',
            'department_id' => 'required|exists:departments,id',
            'salary' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive,on_leave,suspended',
        ]);

        $validated['employee_id'] = $validated['employee_id'] ?? 'EMP' . str_pad(Employee::max('id') + 1, 5, '0', STR_PAD_LEFT);
        $validated['status'] = $validated['status'] ?? 'active';

        Employee::create($validated);

        return redirect()->route('employees.index')->with('success', 'Employee created successfully.');
    }

    public function show(Employee $employee)
    {
        $employee->load(['user', 'department']);

        return Inertia::render('Employee/Show', [
            'employee' => $employee,
        ]);
    }

    public function edit(Employee $employee)
    {
        $departments = Department::orderBy('name')->get();
        $users = User::whereDoesntHave('employee')->orWhere('id', $employee->user_id)->orderBy('name')->get();

        return Inertia::render('Employee/Edit', [
            'employee' => $employee,
            'departments' => $departments,
            'users' => $users,
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:employees,user_id,' . $employee->id,
            'employee_id' => 'nullable|string|max:50|unique:employees,employee_id,' . $employee->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'hire_date' => 'required|date',
            'position' => 'required|string|max:100',
            'department_id' => 'required|exists:departments,id',
            'salary' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive,on_leave,suspended',
        ]);

        $employee->update($validated);

        return redirect()->route('employees.index')->with('success', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();

        return redirect()->route('employees.index')->with('success', 'Employee deleted successfully.');
    }
}
