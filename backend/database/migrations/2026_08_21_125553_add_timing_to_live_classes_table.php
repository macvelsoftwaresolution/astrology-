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
        Schema::table('live_classes', function (Blueprint $table) {
            if (!Schema::hasColumn('live_classes', 'date_text')) {
                $table->string('date_text')->nullable()->default('இன்று');
            }
            if (!Schema::hasColumn('live_classes', 'time_text')) {
                $table->string('time_text')->nullable()->default('மாலை 06:00 - 07:30');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('live_classes', function (Blueprint $table) {
            if (Schema::hasColumn('live_classes', 'date_text')) {
                $table->dropColumn('date_text');
            }
            if (Schema::hasColumn('live_classes', 'time_text')) {
                $table->dropColumn('time_text');
            }
        });
    }
};
