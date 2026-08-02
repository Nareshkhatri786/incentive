<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeLedger;
use App\Services\PayrollCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeLedgerController extends Controller
{
    public function index(PayrollCalculator $calculator)
    {
        $employees = Employee::where('status', 'Active')->get();
        $statements = [];

        foreach ($employees as $emp) {
            $statements[] = $calculator->getEmployeeStatement($emp->id);
        }

        $ledgerEntries = EmployeeLedger::with(['employee', 'booking'])
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('EmployeeLedger/Index', [
            'statements' => $statements,
            'employees' => $employees,
            'ledgerEntries' => $ledgerEntries,
        ]);
    }

    public function salaryAdjustment(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
            'entry_type' => 'required|in:SALARY_PAID,SALARY_DEDUCTION,SALARY_BONUS',
            'description' => 'required|string|max:255',
        ]);

        EmployeeLedger::create([
            'employee_id' => $validated['employee_id'],
            'entry_type' => $validated['entry_type'],
            'amount' => $validated['amount'],
            'status' => 'Settled',
            'transaction_date' => $validated['transaction_date'],
            'description' => $validated['description'],
        ]);

        return redirect()->back()->with('success', 'Salary adjustment recorded.');
    }

    public function giveAdvance(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'amount' => 'required|numeric|min:1',
            'advance_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        EmployeeLedger::create([
            'employee_id' => $validated['employee_id'],
            'entry_type' => 'ADVANCE_DEBIT',
            'amount' => $validated['amount'],
            'status' => 'Active',
            'transaction_date' => $validated['advance_date'],
            'description' => $validated['description'] ?? 'On Account Advance',
        ]);

        return redirect()->back()->with('success', 'Advance issued successfully.');
    }

    public function markIncentivePaid(Request $request, EmployeeLedger $ledger)
    {
        $ledger->update(['status' => 'Paid']);

        return redirect()->back()->with('success', 'Incentive marked as paid.');
    }
}
