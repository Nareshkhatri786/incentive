<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpenseLedger extends Model
{
    protected $table = 'expense_ledger';

    protected $fillable = [
        'category',
        'amount',
        'expense_date',
        'paid_to',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];
}
