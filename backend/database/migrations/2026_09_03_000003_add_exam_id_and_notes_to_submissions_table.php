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
        Schema::table('student_submissions', function (Blueprint $table) {
            if (!Schema::hasColumn('student_submissions', 'exam_id')) {
                $table->unsignedBigInteger('exam_id')->nullable()->after('assessment_id');
            }
            if (!Schema::hasColumn('student_submissions', 'notes')) {
                $table->text('notes')->nullable()->after('pdf_url');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_submissions', function (Blueprint $table) {
            if (Schema::hasColumn('student_submissions', 'exam_id')) {
                $table->dropColumn(['exam_id', 'notes']);
            }
        });
    }
};
