<?php

namespace App\Http\Controllers;

use App\Models\ExpenseLedger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index()
    {
        $expenses = ExpenseLedger::orderBy('expense_date', 'desc')->get();
        $totalExpense = $expenses->sum('amount');

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses,
            'totalExpense' => $totalExpense,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:100',
            'amount' => 'required|numeric|min:1',
            'expense_date' => 'required|date',
            'paid_to' => 'nullable|string|max:120',
            'notes' => 'nullable|string',
        ]);

        ExpenseLedger::create($validated);

        return redirect()->back()->with('success', 'Office expense recorded successfully.');
    }
}
