<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('seminars') && !Schema::hasColumn('seminars', 'recording_video_url')) {
            Schema::table('seminars', function (Blueprint $table) {
                $table->string('recording_video_url')->nullable()->after('join_url');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('seminars') && Schema::hasColumn('seminars', 'recording_video_url')) {
            Schema::table('seminars', function (Blueprint $table) {
                $table->dropColumn('recording_video_url');
            });
        }
    }
};
