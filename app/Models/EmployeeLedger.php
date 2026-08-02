<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeLedger extends Model
{
    protected $table = 'employee_ledger';

    protected $fillable = [
        'employee_id',
        'booking_id',
        'entry_type',
        'amount',
        'status',
        'transaction_date',
        'description',
        'is_manual',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}
