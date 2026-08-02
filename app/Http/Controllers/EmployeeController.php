<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::orderBy('name')->get();

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'nullable|email|max:100',
            'mobile' => 'required|string|max:20|unique:employees,mobile',
            'username' => 'required|string|max:50|unique:employees,username',
            'password' => 'required|string|min:6',
            'role' => 'required|string|max:50',
            'monthly_salary' => 'required|numeric|min:0',
            'is_admin' => 'boolean',
        ]);

        Employee::create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'mobile' => $validated['mobile'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'monthly_salary' => $validated['monthly_salary'],
            'status' => 'Active',
            'is_admin' => $validated['is_admin'] ?? false,
        ]);

        return redirect()->back()->with('success', 'Employee created successfully.');
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'nullable|email|max:100',
            'mobile' => 'required|string|max:20|unique:employees,mobile,' . $employee->id,
            'role' => 'required|string|max:50',
            'monthly_salary' => 'required|numeric|min:0',
            'status' => 'required|in:Active,Inactive',
            'is_admin' => 'boolean',
        ]);

        $employee->update($validated);

        return redirect()->back()->with('success', 'Employee updated successfully.');
    }
}
