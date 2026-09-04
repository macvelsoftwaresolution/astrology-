<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('live_classes', function (Blueprint $table) {
            if (!Schema::hasColumn('live_classes', 'banner_image_url')) {
                $table->string('banner_image_url')->nullable()->after('link');
            }
        });
    }

    public function down(): void
    {
        Schema::table('live_classes', function (Blueprint $table) {
            if (Schema::hasColumn('live_classes', 'banner_image_url')) {
                $table->dropColumn('banner_image_url');
            }
        });
    }
};
