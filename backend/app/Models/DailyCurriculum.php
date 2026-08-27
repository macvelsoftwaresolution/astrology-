<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyCurriculum extends Model
{
    use HasFactory;

    protected $table = 'daily_curriculum';

    protected $fillable = [
        'batch_id',
        'day_number',
        'title',
        'description',
        'audio_url',
        'audios_json',
        'images_json',
        'pdf_material_url',
        'pdfs_json',
        'is_published',
    ];

    protected $casts = [
        'audios_json'  => 'array',
        'images_json'  => 'array',
        'pdfs_json'    => 'array',
        'is_published' => 'boolean',
        'day_number'   => 'integer',
    ];

    public function batch()
    {
        return $this->belongsTo(CourseBatch::class, 'batch_id');
    }
}
