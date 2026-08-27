<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentDailyProgress extends Model
{
    use HasFactory;

    protected $table = 'student_daily_progress';

    protected $fillable = [
        'student_id',
        'curriculum_id',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function curriculum()
    {
        return $this->belongsTo(DailyCurriculum::class, 'curriculum_id');
    }
}
