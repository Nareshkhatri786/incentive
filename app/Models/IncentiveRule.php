<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IncentiveRule extends Model
{
    protected $table = 'incentive_rules';

    protected $fillable = [
        'project_id',
        'employee_id',
        'rule_type',
        'value',
        'release_trigger',
        'condition_logic',
        'status',
        'effective_from',
        'effective_to',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}
