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
        Schema::table('certificates', function (Blueprint $table) {
            if (!Schema::hasColumn('certificates', 'course_level')) {
                $table->string('course_level', 20)->default('UG')->after('course_id');
            }
            if (!Schema::hasColumn('certificates', 'student_name_ta')) {
                $table->string('student_name_ta')->nullable()->after('course_level');
            }
            if (!Schema::hasColumn('certificates', 'student_name_en')) {
                $table->string('student_name_en')->nullable()->after('student_name_ta');
            }
            if (!Schema::hasColumn('certificates', 'photo_url')) {
                $table->text('photo_url')->nullable()->after('student_name_en');
            }
            if (!Schema::hasColumn('certificates', 'registration_number')) {
                $table->string('registration_number')->nullable()->after('photo_url');
            }
            if (!Schema::hasColumn('certificates', 'center_name')) {
                $table->string('center_name')->default('பல்லடம்')->after('registration_number');
            }
            if (!Schema::hasColumn('certificates', 'center_name_en')) {
                $table->string('center_name_en')->default('PALLADAM')->after('center_name');
            }
            if (!Schema::hasColumn('certificates', 'course_period_from')) {
                $table->string('course_period_from')->nullable()->after('center_name_en');
            }
            if (!Schema::hasColumn('certificates', 'course_period_to')) {
                $table->string('course_period_to')->nullable()->after('course_period_from');
            }
            if (!Schema::hasColumn('certificates', 'exam_date')) {
                $table->string('exam_date')->nullable()->after('course_period_to');
            }
            if (!Schema::hasColumn('certificates', 'academic_year')) {
                $table->string('academic_year')->nullable()->after('exam_date');
            }
            if (!Schema::hasColumn('certificates', 'award_title_ta')) {
                $table->string('award_title_ta')->default('ஜோதிட ரத்னா')->after('academic_year');
            }
            if (!Schema::hasColumn('certificates', 'award_title_en')) {
                $table->string('award_title_en')->default('JOTHIDA RATHNA')->after('award_title_ta');
            }
            if (!Schema::hasColumn('certificates', 'issue_place')) {
                $table->string('issue_place')->default('பெரியகுளம்')->after('award_title_en');
            }
            if (!Schema::hasColumn('certificates', 'marksheet_number')) {
                $table->string('marksheet_number')->nullable()->after('issue_place');
            }
            if (!Schema::hasColumn('certificates', 'marksheet_download_url')) {
                $table->string('marksheet_download_url')->nullable()->after('marksheet_number');
            }
            if (!Schema::hasColumn('certificates', 'theory1_mark')) {
                $table->integer('theory1_mark')->nullable()->after('marksheet_download_url');
            }
            if (!Schema::hasColumn('certificates', 'theory2_mark')) {
                $table->integer('theory2_mark')->nullable()->after('theory1_mark');
            }
            if (!Schema::hasColumn('certificates', 'practical1_mark')) {
                $table->integer('practical1_mark')->nullable()->after('theory2_mark');
            }
            if (!Schema::hasColumn('certificates', 'practical2_mark')) {
                $table->integer('practical2_mark')->nullable()->after('practical1_mark');
            }
            if (!Schema::hasColumn('certificates', 'practical3_mark')) {
                $table->integer('practical3_mark')->nullable()->after('practical2_mark');
            }
            if (!Schema::hasColumn('certificates', 'total_marks')) {
                $table->integer('total_marks')->nullable()->after('practical3_mark');
            }
            if (!Schema::hasColumn('certificates', 'percentage')) {
                $table->string('percentage', 10)->nullable()->after('total_marks');
            }
            if (!Schema::hasColumn('certificates', 'grade')) {
                $table->string('grade', 50)->nullable()->after('percentage');
            }
            if (!Schema::hasColumn('certificates', 'pass_status')) {
                $table->string('pass_status', 20)->default('PASS')->after('grade');
            }
            if (!Schema::hasColumn('certificates', 'custom_data')) {
                $table->json('custom_data')->nullable()->after('pass_status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropColumn([
                'course_level',
                'student_name_ta',
                'student_name_en',
                'photo_url',
                'registration_number',
                'center_name',
                'center_name_en',
                'course_period_from',
                'course_period_to',
                'exam_date',
                'academic_year',
                'award_title_ta',
                'award_title_en',
                'issue_place',
                'marksheet_number',
                'marksheet_download_url',
                'theory1_mark',
                'theory2_mark',
                'practical1_mark',
                'practical2_mark',
                'practical3_mark',
                'total_marks',
                'percentage',
                'grade',
                'pass_status',
                'custom_data',
            ]);
        });
    }
};
