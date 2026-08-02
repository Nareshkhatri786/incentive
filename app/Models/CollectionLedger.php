<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CollectionLedger extends Model
{
    protected $table = 'collection_ledger';

    protected $fillable = [
        'booking_id',
        'amount',
        'payment_mode',
        'payment_date',
        'reference_number',
        'notes',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}
