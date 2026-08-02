<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeLedger;
use App\Models\SiteVisit;
use Illuminate\Support\Facades\DB;

class PayrollCalculator
{
    public function getEmployeeStatement(int $employeeId): array
    {
        $employee = Employee::findOrFail($employeeId);
        
        $incentivesEarned = EmployeeLedger::where('employee_id', $employeeId)
            ->where('entry_type', 'INCENTIVE_CREDIT')
            ->whereIn('status', ['Eligible', 'Paid'])
            ->sum('amount');

        $incentivesPaid = EmployeeLedger::where('employee_id', $employeeId)
            ->where('entry_type', 'INCENTIVE_CREDIT')
            ->where('status', 'Paid')
            ->sum('amount');

        $activeAdvances = EmployeeLedger::where('employee_id', $employeeId)
            ->where('entry_type', 'ADVANCE_DEBIT')
            ->where('status', 'Active')
            ->sum('amount');

        $salaryDeductions = EmployeeLedger::where('employee_id', $employeeId)
            ->where('entry_type', 'SALARY_DEDUCTION')
            ->sum('amount');

        $salaryBonuses = EmployeeLedger::where('employee_id', $employeeId)
            ->where('entry_type', 'SALARY_BONUS')
            ->sum('amount');

        $salaryPaid = EmployeeLedger::where('employee_id', $employeeId)
            ->where('entry_type', 'SALARY_PAID')
            ->sum('amount');

        $monthlySalary = $employee->status === 'Active' ? $employee->monthly_salary : 0;

        $netPayable = ($monthlySalary + $incentivesEarned + $visitBonus + $salaryBonuses) - ($activeAdvances + $salaryDeductions + $paymentsMade + $salaryPaid);

        return [
            'employee' => $employee,
            'monthly_salary' => $monthlySalary,
            'incentives_earned' => $incentivesEarned,
            'incentives_paid' => $incentivesPaid,
            'active_advances' => $activeAdvances,
            'salary_deductions' => $salaryDeductions,
            'salary_bonuses' => $salaryBonuses,
            'payments_made' => $paymentsMade,
            'monthly_visits' => $monthlyVisits,
            'visit_bonus' => $visitBonus,
            'net_payable' => max(0, $netPayable),
        ];
    }
}
