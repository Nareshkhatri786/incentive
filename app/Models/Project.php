<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'name',
        'location',
        'status',
    ];

    public function rules()
    {
        return $this->hasMany(IncentiveRule::class, 'project_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'project_id');
    }
}
