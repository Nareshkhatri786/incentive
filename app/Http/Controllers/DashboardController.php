<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\CollectionLedger;
use App\Models\Employee;
use App\Models\EmployeeLedger;
use App\Models\ExpenseLedger;
use App\Models\SiteVisit;
use App\Services\PayrollCalculator;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(PayrollCalculator $calculator)
    {
        $totalBusiness = Booking::sum('basic_amount');
        $totalCollection = CollectionLedger::sum('amount');
        $totalOutstanding = $totalBusiness - $totalCollection;

        $employees = Employee::where('status', 'Active')->get();
        $totalSalaryDue = $employees->sum('monthly_salary');
        
        $totalIncentiveDue = EmployeeLedger::where('entry_type', 'INCENTIVE_CREDIT')
            ->where('status', 'Eligible')
            ->sum('amount');

        $totalActiveAdvances = EmployeeLedger::where('entry_type', 'ADVANCE_DEBIT')
            ->where('status', 'Active')
            ->sum('amount');

        $totalEmployeePayable = 0;
        foreach ($employees as $emp) {
            $stmt = $calculator->getEmployeeStatement($emp->id);
            $totalEmployeePayable += $stmt['net_payable'];
        }

        $currentMonth = now()->format('Y-m');
        $monthlyExpenses = ExpenseLedger::where('expense_date', 'like', "$currentMonth%")->sum('amount');
        $monthlyVisits = SiteVisit::where('visit_date', 'like', "$currentMonth%")->sum('visit_count');

        $recentCollections = CollectionLedger::with('booking')
            ->orderBy('payment_date', 'desc')
            ->take(5)
            ->get();

        $recentExpenses = ExpenseLedger::orderBy('expense_date', 'desc')
            ->take(5)
            ->get();

        $pendingIncentives = EmployeeLedger::with('employee')
            ->where('entry_type', 'INCENTIVE_CREDIT')
            ->where('status', 'Eligible')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'metrics' => [
                'total_business' => $totalBusiness,
                'total_collection' => $totalCollection,
                'total_outstanding' => $totalOutstanding,
                'total_salary_due' => $totalSalaryDue,
                'total_incentive_due' => $totalIncentiveDue,
                'total_active_advances' => $totalActiveAdvances,
                'total_employee_payable' => $totalEmployeePayable,
                'monthly_expenses' => $monthlyExpenses,
                'monthly_visits' => $monthlyVisits,
            ],
            'recentCollections' => $recentCollections,
            'recentExpenses' => $recentExpenses,
            'pendingIncentives' => $pendingIncentives,
        ]);
    }
}
