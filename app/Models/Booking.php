<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'project_id',
        'customer_name',
        'customer_mobile',
        'unit_number',
        'basic_amount',
        'extra_charges',
        'discount_amount',
        'booking_date',
        'status',
        'bana_khat_date',
        'sale_deed_date',
    ];

    protected $casts = [
        'basic_amount' => 'decimal:2',
        'extra_charges' => 'decimal:2',
        'discount_amount' => 'decimal:2',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function assignments()
    {
        return $this->hasMany(BookingAssignment::class, 'booking_id');
    }

    public function collections()
    {
        return $this->hasMany(CollectionLedger::class, 'booking_id');
    }

    public function incentives()
    {
        return $this->hasMany(EmployeeLedger::class, 'booking_id');
    }
}
