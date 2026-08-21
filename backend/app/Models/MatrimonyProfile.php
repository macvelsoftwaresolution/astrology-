<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MatrimonyProfile extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'gender',
        'phone_number',
        'full_address',
        'rasi',
        'nakshatra',
        'status'
    ];
}
