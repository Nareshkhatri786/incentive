<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Employee;
use App\Models\IncentiveRule;
use App\Services\IncentiveEngine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::with(['rules.employee'])->get();
        $employees = Employee::get(['id', 'name', 'role', 'status']);

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:projects,name',
            'location' => 'nullable|string|max:255',
        ]);

        Project::create([
            'name' => $validated['name'],
            'location' => $validated['location'] ?? null,
            'status' => 'Active',
        ]);

        return redirect()->back()->with('success', 'Project created successfully.');
    }

    public function addRule(Request $request, Project $project, IncentiveEngine $engine)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'rule_type' => 'required|in:Percentage,Fixed',
            'value' => 'required|numeric|min:0',
            'release_trigger' => 'required|in:Booking,Bana Khat,Sale Deed,Collection',
            'condition_logic' => 'nullable|string',
            'status' => 'required|in:Active,Inactive',
            'effective_from' => 'nullable|date',
            'effective_to' => 'nullable|date',
        ]);

        IncentiveRule::create([
            'project_id' => $project->id,
            'employee_id' => $validated['employee_id'],
            'rule_type' => $validated['rule_type'],
            'value' => $validated['value'],
            'release_trigger' => $validated['release_trigger'],
            'condition_logic' => $validated['condition_logic'] ?? null,
            'status' => $validated['status'],
            'effective_from' => $validated['effective_from'] ?? null,
            'effective_to' => $validated['effective_to'] ?? null,
        ]);

        $this->recalculateProjectBookings($project->id, $engine);

        return redirect()->back()->with('success', 'Incentive rule added successfully.');
    }

    public function updateRule(Request $request, IncentiveRule $rule, IncentiveEngine $engine)
    {
        $validated = $request->validate([
            'rule_type' => 'required|in:Percentage,Fixed',
            'value' => 'required|numeric|min:0',
            'release_trigger' => 'required|in:Booking,Bana Khat,Sale Deed,Collection',
            'condition_logic' => 'nullable|string',
            'status' => 'required|in:Active,Inactive',
            'effective_from' => 'nullable|date',
            'effective_to' => 'nullable|date',
        ]);

        $rule->update($validated);

        $this->recalculateProjectBookings($rule->project_id, $engine);

        return redirect()->back()->with('success', 'Incentive rule updated successfully.');
    }

    public function toggleRuleStatus(IncentiveRule $rule, IncentiveEngine $engine)
    {
        $newStatus = $rule->status === 'Active' ? 'Inactive' : 'Active';
        $rule->update(['status' => $newStatus]);

        $this->recalculateProjectBookings($rule->project_id, $engine);

        return redirect()->back()->with('success', "Rule is now {$newStatus}.");
    }

    public function destroyRule(IncentiveRule $rule, IncentiveEngine $engine)
    {
        $projectId = $rule->project_id;
        $rule->delete();

        $this->recalculateProjectBookings($projectId, $engine);

        return redirect()->back()->with('success', 'Incentive rule removed.');
    }

    private function recalculateProjectBookings(int $projectId, IncentiveEngine $engine): void
    {
        $bookingIds = \App\Models\Booking::where('project_id', $projectId)->pluck('id');
        foreach ($bookingIds as $bId) {
            $engine->calculateForBooking($bId);
        }
    }
}
