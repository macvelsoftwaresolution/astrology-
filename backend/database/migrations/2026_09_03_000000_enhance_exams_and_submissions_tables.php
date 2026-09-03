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
        // 1. Enhance exams table for Practical Jadhaga Kattam Chart questions
        Schema::table('exams', function (Blueprint $table) {
            if (!Schema::hasColumn('exams', 'practical_prompt')) {
                $table->text('practical_prompt')->nullable()->after('pass_mark');
            }
            if (!Schema::hasColumn('exams', 'chart_image_url')) {
                $table->text('chart_image_url')->nullable()->after('practical_prompt');
            }
            if (!Schema::hasColumn('exams', 'batch_id')) {
                $table->unsignedBigInteger('batch_id')->nullable()->after('chart_image_url');
            }
        });

        // 2. Enhance student_submissions table for MCQ + Practical Score Breakdown & Publishing
        Schema::table('student_submissions', function (Blueprint $table) {
            if (!Schema::hasColumn('student_submissions', 'batch_id')) {
                $table->unsignedBigInteger('batch_id')->nullable()->after('course_id');
            }
            if (!Schema::hasColumn('student_submissions', 'mcq_score')) {
                $table->integer('mcq_score')->nullable()->after('score');
            }
            if (!Schema::hasColumn('student_submissions', 'practical_score')) {
                $table->integer('practical_score')->nullable()->after('mcq_score');
            }
            if (!Schema::hasColumn('student_submissions', 'total_score')) {
                $table->integer('total_score')->nullable()->after('practical_score');
            }
            if (!Schema::hasColumn('student_submissions', 'is_published')) {
                $table->boolean('is_published')->default(false)->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            if (Schema::hasColumn('exams', 'practical_prompt')) {
                $table->dropColumn(['practical_prompt', 'chart_image_url', 'batch_id']);
            }
        });

        Schema::table('student_submissions', function (Blueprint $table) {
            if (Schema::hasColumn('student_submissions', 'mcq_score')) {
                $table->dropColumn(['batch_id', 'mcq_score', 'practical_score', 'total_score', 'is_published']);
            }
        });
    }
};
