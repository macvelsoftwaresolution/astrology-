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
        Schema::table('exams', function (Blueprint $table) {
            if (!Schema::hasColumn('exams', 'start_time')) {
                $table->dateTime('start_time')->nullable()->after('exam_date');
            }
            if (!Schema::hasColumn('exams', 'grace_period_mins')) {
                $table->integer('grace_period_mins')->default(20)->after('duration');
            }
        });

        Schema::table('student_submissions', function (Blueprint $table) {
            if (!Schema::hasColumn('student_submissions', 'attempt_number')) {
                $table->integer('attempt_number')->default(1)->after('score');
            }
            if (!Schema::hasColumn('student_submissions', 'is_reattempt_allowed')) {
                $table->boolean('is_reattempt_allowed')->default(false)->after('is_published');
            }
            if (!Schema::hasColumn('student_submissions', 'reattempt_start_time')) {
                $table->dateTime('reattempt_start_time')->nullable()->after('is_reattempt_allowed');
            }
            if (!Schema::hasColumn('student_submissions', 'reattempt_exam_id')) {
                $table->unsignedBigInteger('reattempt_exam_id')->nullable()->after('reattempt_start_time');
            }
            if (!Schema::hasColumn('student_submissions', 'reattempt_notes')) {
                $table->text('reattempt_notes')->nullable()->after('reattempt_exam_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            if (Schema::hasColumn('exams', 'start_time')) {
                $table->dropColumn('start_time');
            }
            if (Schema::hasColumn('exams', 'grace_period_mins')) {
                $table->dropColumn('grace_period_mins');
            }
        });

        Schema::table('student_submissions', function (Blueprint $table) {
            $cols = ['attempt_number', 'is_reattempt_allowed', 'reattempt_start_time', 'reattempt_exam_id', 'reattempt_notes'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('student_submissions', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
