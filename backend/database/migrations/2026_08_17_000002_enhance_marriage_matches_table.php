<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('marriage_matches', function (Blueprint $table) {
            if (!Schema::hasColumn('marriage_matches', 'request_type')) {
                $table->string('request_type')->default('pair_match')->after('user_id'); // pair_match, single_search
            }
            if (!Schema::hasColumn('marriage_matches', 'candidate_gender')) {
                $table->string('candidate_gender')->nullable()->after('request_type'); // groom (மணமகன் தேவை), bride (மணமகள் தேவை)
            }
            if (!Schema::hasColumn('marriage_matches', 'education_job')) {
                $table->string('education_job')->nullable()->after('girl_nakshatra');
            }
            if (!Schema::hasColumn('marriage_matches', 'preferences')) {
                $table->text('preferences')->nullable()->after('education_job'); // expectations (age, caste, district, etc)
            }
            if (!Schema::hasColumn('marriage_matches', 'requester_phone')) {
                $table->string('requester_phone')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('marriage_matches', 'admin_status')) {
                $table->string('admin_status')->default('Pending')->after('match_details'); // Pending, Contacted, Completed, Followup
            }
            if (!Schema::hasColumn('marriage_matches', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('admin_status');
            }
            // Make boy/girl fields nullable to support single search
            $table->string('boy_name')->nullable()->change();
            $table->date('boy_dob')->nullable()->change();
            $table->string('girl_name')->nullable()->change();
            $table->date('girl_dob')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('marriage_matches', function (Blueprint $table) {
            if (Schema::hasColumn('marriage_matches', 'request_type')) {
                $table->dropColumn(['request_type', 'candidate_gender', 'education_job', 'preferences', 'requester_phone', 'admin_status', 'admin_notes']);
            }
        });
    }
};
