<?php

namespace App\Http\Controllers;

use App\Models\SiteVisit;
use App\Models\Employee;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteVisitController extends Controller
{
    public function index(Request $request)
    {
        $selectedMonth = $request->input('month', now()->format('Y-m'));

        $employees = Employee::where('status', 'Active')->orderBy('name')->get(['id', 'name', 'role']);
        $projects = Project::where('status', 'Active')->orderBy('name')->get(['id', 'name']);

        $visits = SiteVisit::with(['employee', 'project'])
            ->where('visit_date', 'like', "{$selectedMonth}%")
            ->orderBy('visit_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        $summary = $employees->map(function ($emp) use ($selectedMonth) {
            $count = (int) SiteVisit::where('employee_id', $emp->id)
                ->where('visit_date', 'like', "{$selectedMonth}%")
                ->sum('visit_count');

            $bonus = 0;
            $nextSlab = 20;
            $slabName = 'No Slab Yet';

            if ($count >= 50) {
                $bonus = 1500;
                $slabName = '50+ Visits (₹1,500)';
                $nextSlab = 50;
            } elseif ($count >= 40) {
                $bonus = 1000;
                $slabName = '40+ Visits (₹1,000)';
                $nextSlab = 50;
            } elseif ($count >= 30) {
                $bonus = 750;
                $slabName = '30+ Visits (₹750)';
                $nextSlab = 40;
            } elseif ($count >= 20) {
                $bonus = 500;
                $slabName = '20+ Visits (₹500)';
                $nextSlab = 30;
            }

            return [
                'employee_id' => $emp->id,
                'employee_name' => $emp->name,
                'role' => $emp->role,
                'visit_count' => $count,
                'bonus' => $bonus,
                'slab_name' => $slabName,
                'next_slab' => $nextSlab,
            ];
        });

        $totalVisitsMonth = (int) $visits->sum('visit_count');
        $totalBonusMonth = (int) $summary->sum('bonus');

        return Inertia::render('SiteVisits/Index', [
            'visits' => $visits,
            'summary' => $summary,
            'employees' => $employees,
            'projects' => $projects,
            'selectedMonth' => $selectedMonth,
            'totalVisitsMonth' => $totalVisitsMonth,
            'totalBonusMonth' => $totalBonusMonth,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'project_id' => 'required|exists:projects,id',
            'visit_count' => 'required|integer|min:1|max:100',
            'visit_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        SiteVisit::create($validated);

        return redirect()->back()->with('success', 'Site visits recorded successfully.');
    }

    public function destroy(SiteVisit $visit)
    {
        $visit->delete();

        return redirect()->back()->with('success', 'Site visit record deleted.');
    }
}
