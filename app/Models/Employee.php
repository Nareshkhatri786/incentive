<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Employee extends Authenticatable
{
    use Notifiable;

    protected $table = 'employees';

    protected $fillable = [
        'name',
        'email',
        'mobile',
        'username',
        'password',
        'role',
        'monthly_salary',
        'status',
        'is_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'monthly_salary' => 'decimal:2',
        'is_admin' => 'boolean',
    ];

    public function rules()
    {
        return $this->hasMany(IncentiveRule::class, 'employee_id');
    }
}
