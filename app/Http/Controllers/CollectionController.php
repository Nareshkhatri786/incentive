<?php

namespace App\Http\Controllers;

use App\Models\CollectionLedger;
use App\Models\Booking;
use App\Services\IncentiveEngine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CollectionController extends Controller
{
    public function index()
    {
        $collections = CollectionLedger::with(['booking.project'])
            ->orderBy('payment_date', 'desc')
            ->get();

        return Inertia::render('Collections/Index', [
            'collections' => $collections,
        ]);
    }

    public function store(Request $request, IncentiveEngine $engine)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'amount' => 'required|numeric|min:1',
            'payment_mode' => 'required|in:Cheque,NEFT_RTGS,Cash,UPI',
            'payment_date' => 'required|date',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $engine) {
            CollectionLedger::create($validated);
            // Re-evaluate milestone & collection-based incentives
            $engine->calculateForBooking($validated['booking_id']);
        });

        return redirect()->back()->with('success', 'Collection payment recorded successfully.');
    }
}
