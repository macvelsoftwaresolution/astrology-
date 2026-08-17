<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rasi_palans', function (Blueprint $table) {
            if (!Schema::hasColumn('rasi_palans', 'video_url')) {
                $table->string('video_url')->nullable()->after('audio_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('rasi_palans', function (Blueprint $table) {
            if (Schema::hasColumn('rasi_palans', 'video_url')) {
                $table->dropColumn('video_url');
            }
        });
    }
};
