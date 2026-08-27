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
        if (Schema::hasTable('marriage_matches')) {
            Schema::table('marriage_matches', function (Blueprint $table) {
                if (!Schema::hasColumn('marriage_matches', 'report_data')) {
                    $table->json('report_data')->nullable()->after('match_details');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('marriage_matches')) {
            Schema::table('marriage_matches', function (Blueprint $table) {
                if (Schema::hasColumn('marriage_matches', 'report_data')) {
                    $table->dropColumn('report_data');
                }
            });
        }
    }
};
