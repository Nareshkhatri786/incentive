<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Project;
use App\Models\Employee;
use App\Models\BookingAssignment;
use App\Services\IncentiveEngine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index()
    {
        $bookings = Booking::with(['project', 'collections', 'assignments.employee'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($b) {
                $collected = $b->collections->sum('amount');
                return [
                    'id' => $b->id,
                    'project_name' => $b->project->name ?? 'N/A',
                    'project_id' => $b->project_id,
                    'customer_name' => $b->customer_name,
                    'unit_number' => $b->unit_number,
                    'basic_amount' => $b->basic_amount,
                    'total_collected' => $collected,
                    'pending_balance' => $b->basic_amount - $collected,
                    'status' => $b->status,
                    'booking_date' => $b->booking_date,
                    'assignments' => $b->assignments->pluck('employee.name'),
                ];
            });

        $projects = Project::where('status', 'Active')->get(['id', 'name']);
        $employees = Employee::where('status', 'Active')->get(['id', 'name']);

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
            'projects' => $projects,
            'employees' => $employees,
        ]);
    }

    public function show(Booking $booking, IncentiveEngine $engine)
    {
        // Calculate latest incentives to guarantee accuracy
        $engine->calculateForBooking($booking->id);

        $booking->load(['project', 'collections', 'incentives.employee', 'assignments.employee']);
        
        $totalCollected = $booking->collections->sum('amount');

        return Inertia::render('Bookings/Show', [
            'booking' => [
                'id' => $booking->id,
                'customer_name' => $booking->customer_name,
                'customer_mobile' => $booking->customer_mobile,
                'unit_number' => $booking->unit_number,
                'basic_amount' => $booking->basic_amount,
                'total_collected' => $totalCollected,
                'pending_balance' => $booking->basic_amount - $totalCollected,
                'status' => $booking->status,
                'booking_date' => $booking->booking_date,
                'bana_khat_date' => $booking->bana_khat_date,
                'sale_deed_date' => $booking->sale_deed_date,
                'project_name' => $booking->project->name ?? '',
                'assignments' => $booking->assignments->map(fn($a) => ['id' => $a->employee->id, 'name' => $a->employee->name]),
                'collections' => $booking->collections,
                'incentives' => $booking->incentives->map(fn($i) => [
                    'id' => $i->id,
                    'employee_name' => $i->employee->name ?? 'Unknown',
                    'rule_description' => $i->description,
                    'amount' => $i->amount,
                    'status' => $i->status,
                ]),
            ]
        ]);
    }

    public function store(Request $request, IncentiveEngine $engine)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'customer_name' => 'required|string|max:120',
            'unit_number' => 'required|string|max:50',
            'basic_amount' => 'required|numeric|min:0',
            'booking_date' => 'required|date',
            'status' => 'required|in:Booking Done,Bana Khat Done,Sale Deed Done,Completed',
            'assignments' => 'array',
            'assignments.*.employee_id' => 'required|exists:employees,id',
        ]);

        DB::transaction(function () use ($validated, $engine) {
            $booking = Booking::create([
                'project_id' => $validated['project_id'],
                'customer_name' => $validated['customer_name'],
                'unit_number' => $validated['unit_number'],
                'basic_amount' => $validated['basic_amount'],
                'booking_date' => $validated['booking_date'],
                'status' => $validated['status'],
            ]);

            if (!empty($validated['assignments'])) {
                foreach ($validated['assignments'] as $asgn) {
                    BookingAssignment::create([
                        'booking_id' => $booking->id,
                        'employee_id' => $asgn['employee_id'],
                    ]);
                }
            }

            $engine->calculateForBooking($booking->id);
        });

        return redirect()->back()->with('success', 'Booking created successfully.');
    }

    public function updateStatus(Request $request, Booking $booking, IncentiveEngine $engine)
    {
        $validated = $request->validate([
            'status' => 'required|in:Booking Done,Bana Khat Done,Sale Deed Done,Completed,Cancelled',
        ]);

        $booking->update(['status' => $validated['status']]);
        $engine->calculateForBooking($booking->id);

        return redirect()->back()->with('success', 'Booking status updated successfully.');
    }
}
