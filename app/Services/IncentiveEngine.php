<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\IncentiveRule;
use App\Models\EmployeeLedger;
use Illuminate\Support\Facades\DB;

class IncentiveEngine
{
    public function calculateForBooking(int $bookingId): void
    {
        $booking = Booking::with(['assignments.employee', 'collections'])->findOrFail($bookingId);
        $totalCollected = $booking->collections->sum('amount');
        $bookingDate = $booking->booking_date;

        // Delete future or eligible incentives that were not manually marked as Paid
        EmployeeLedger::where('booking_id', $bookingId)
            ->where('entry_type', 'INCENTIVE_CREDIT')
            ->where('status', '!=', 'Paid')
            ->where('is_manual', false)
            ->delete();

        foreach ($booking->assignments as $asgn) {
            $empId = $asgn->employee_id;
            $empName = $asgn->employee->name ?? '';

            // Check if employee is Active
            if ($asgn->employee && $asgn->employee->status !== 'Active') {
                continue;
            }

            // Find matching rule applicable on booking_date
            $ruleQuery = IncentiveRule::where('project_id', $booking->project_id)
                ->where('employee_id', $empId)
                ->where(function ($q) {
                    $q->where('status', 'Active')
                      ->orWhereNull('status');
                });

            // Date validity check (if effective_from / effective_to specified)
            $ruleQuery->where(function ($q) use ($bookingDate) {
                $q->whereNull('effective_from')
                  ->orWhere('effective_from', '<=', $bookingDate);
            })->where(function ($q) use ($bookingDate) {
                $q->whereNull('effective_to')
                  ->orWhere('effective_to', '>=', $bookingDate);
            });

            $rule = $ruleQuery->orderBy('id', 'desc')->first();

            if ($rule) {
                $amount = 0;
                $status = 'Future';
                $description = "{$rule->rule_type} ({$rule->release_trigger})";

                // Special logic for Keval Pandya or percentage triggers
                if ($empName === 'Keval Pandya') {
                    if ($rule->release_trigger === 'Collection') {
                        $amount = $totalCollected * ($rule->value / 100);
                        $status = ($totalCollected > 0) ? 'Eligible' : 'Future';
                    } else {
                        // Count prior bookings for milestone split
                        $priorCount = Booking::where('project_id', $booking->project_id)
                            ->whereHas('assignments', fn($q) => $q->where('employee_id', $empId))
                            ->where('id', '<', $bookingId)
                            ->count();

                        if ($priorCount < 3 && $rule->rule_type === 'Percentage') {
                            $amount = $booking->basic_amount * ($rule->value / 100);
                        } else {
                            $amount = 5000;
                        }
                    }
                } else {
                    if ($rule->rule_type === 'Percentage') {
                        $amount = $booking->basic_amount * ($rule->value / 100);
                    } else {
                        $amount = $rule->value;
                    }
                }

                // Milestone Release Checks
                if ($rule->release_trigger === 'Booking' && in_array($booking->status, ['Booking Done', 'Bana Khat Done', 'Sale Deed Done', 'Completed'])) {
                    $status = 'Eligible';
                }
                if ($rule->release_trigger === 'Bana Khat' && in_array($booking->status, ['Bana Khat Done', 'Sale Deed Done', 'Completed'])) {
                    $status = 'Eligible';
                }
                if ($rule->release_trigger === 'Sale Deed' && in_array($booking->status, ['Sale Deed Done', 'Completed'])) {
                    $status = 'Eligible';
                }
                if ($rule->release_trigger === 'Collection' && $empName !== 'Keval Pandya' && $totalCollected > 0) {
                    $status = 'Eligible';
                }

                if ($amount > 0) {
                    EmployeeLedger::create([
                        'employee_id' => $empId,
                        'booking_id' => $bookingId,
                        'entry_type' => 'INCENTIVE_CREDIT',
                        'amount' => $amount,
                        'status' => $status,
                        'transaction_date' => now()->toDateString(),
                        'description' => $description,
                        'is_manual' => false,
                    ]);
                }
            }
        }
    }
}
