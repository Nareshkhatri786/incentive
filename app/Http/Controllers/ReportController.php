<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\CollectionLedger;
use App\Models\Employee;
use App\Models\EmployeeLedger;
use App\Models\ExpenseLedger;
use App\Models\Project;
use App\Models\SiteVisit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type', 'collection');
        $projectId = $request->query('project_id');
        $employeeId = $request->query('employee_id');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $projects = Project::get(['id', 'name']);
        $employees = Employee::get(['id', 'name']);

        $reportData = [];

        if ($type === 'collection') {
            $query = CollectionLedger::with(['booking.project']);
            if ($projectId) $query->whereHas('booking', fn($q) => $q->where('project_id', $projectId));
            if ($startDate) $query->where('payment_date', '>=', $startDate);
            if ($endDate) $query->where('payment_date', '<=', $endDate);
            $reportData = $query->orderBy('payment_date', 'desc')->get();
        } elseif ($type === 'outstanding') {
            $query = Booking::with('project', 'collections');
            if ($projectId) $query->where('project_id', $projectId);
            $reportData = $query->get()->map(function ($b) {
                $coll = $b->collections->sum('amount');
                return [
                    'id' => $b->id,
                    'customer_name' => $b->customer_name,
                    'unit_number' => $b->unit_number,
                    'project_name' => $b->project->name ?? '',
                    'basic_amount' => $b->basic_amount,
                    'total_collected' => $coll,
                    'outstanding' => $b->basic_amount - $coll,
                ];
            });
        } elseif ($type === 'expense') {
            $query = ExpenseLedger::query();
            if ($startDate) $query->where('expense_date', '>=', $startDate);
            if ($endDate) $query->where('expense_date', '<=', $endDate);
            $reportData = $query->orderBy('expense_date', 'desc')->get();
        } elseif ($type === 'visit') {
            $query = SiteVisit::with(['employee', 'project']);
            if ($employeeId) $query->where('employee_id', $employeeId);
            if ($projectId) $query->where('project_id', $projectId);
            if ($startDate) $query->where('visit_date', '>=', $startDate);
            if ($endDate) $query->where('visit_date', '<=', $endDate);
            $reportData = $query->orderBy('visit_date', 'desc')->get();
        } elseif ($type === 'employee_ledger') {
            $query = EmployeeLedger::with(['employee', 'booking']);
            if ($employeeId) $query->where('employee_id', $employeeId);
            if ($startDate) $query->where('transaction_date', '>=', $startDate);
            if ($endDate) $query->where('transaction_date', '<=', $endDate);
            $reportData = $query->orderBy('id', 'desc')->get();
        }

        return Inertia::render('Reports/Index', [
            'type' => $type,
            'reportData' => $reportData,
            'projects' => $projects,
            'employees' => $employees,
            'filters' => [
                'project_id' => $projectId,
                'employee_id' => $employeeId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }
}
