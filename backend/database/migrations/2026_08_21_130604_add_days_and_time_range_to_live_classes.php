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
            if (!Schema::hasColumn('live_classes', 'days_of_week')) {
                $table->json('days_of_week')->nullable();
            }
            if (!Schema::hasColumn('live_classes', 'start_time')) {
                $table->string('start_time')->nullable()->default('18:00');
            }
            if (!Schema::hasColumn('live_classes', 'end_time')) {
                $table->string('end_time')->nullable()->default('19:30');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('live_classes', function (Blueprint $table) {
            if (Schema::hasColumn('live_classes', 'days_of_week')) {
                $table->dropColumn('days_of_week');
            }
            if (Schema::hasColumn('live_classes', 'start_time')) {
                $table->dropColumn('start_time');
            }
            if (Schema::hasColumn('live_classes', 'end_time')) {
                $table->dropColumn('end_time');
            }
        });
    }
};
