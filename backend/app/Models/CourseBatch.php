<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseBatch extends Model
{
    use HasFactory;

    protected $table = 'course_batches';

    protected $fillable = [
        'batch_code',
        'name',
        'course_level',
        'year',
        'quarter',
        'start_date',
        'end_date',
        'status',
    ];

    public function curriculum()
    {
        return $this->hasMany(DailyCurriculum::class, 'batch_id')->orderBy('day_number', 'asc');
    }
}
