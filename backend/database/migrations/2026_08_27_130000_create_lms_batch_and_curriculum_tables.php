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
        // 1. Course Batches (4 Batches / Year - 3 Months each)
        Schema::create('course_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_code')->unique(); // e.g. 2026-A, 2026-B, 2026-C, 2026-D
            $table->string('name'); // e.g. Batch A (Feb - Apr 2026)
            $table->string('course_level')->default('ilanilai'); // ilanilai, muthunilai
            $table->integer('year')->default(2026);
            $table->string('quarter')->default('Q1'); // Q1 (Feb-Apr), Q2 (May-Jul), Q3 (Aug-Oct), Q4 (Nov-Jan)
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('status')->default('active'); // active, upcoming, completed
            $table->timestamps();
        });

        // 2. 60-Day Daily Curriculum (Day 1 to Day 60 per Batch)
        Schema::create('daily_curriculum', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('course_batches')->onDelete('cascade');
            $table->integer('day_number'); // 1 to 60
            $table->string('title'); // e.g. நாள் 1: ஜோதிட அறிமுகம்
            $table->longText('description')->nullable(); // Rich Text Notes
            $table->text('audio_url')->nullable(); // Single audio legacy fallback
            $table->json('audios_json')->nullable(); // Multiple Audios [{title, url}]
            $table->json('images_json')->nullable(); // Multiple Diagram / Chart Images Array
            $table->text('pdf_material_url')->nullable(); // Single PDF legacy fallback
            $table->json('pdfs_json')->nullable(); // Multiple PDFs [{title, url}]
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->unique(['batch_id', 'day_number']);
        });

        // 3. Student Daily Progress
        Schema::create('student_daily_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('curriculum_id')->constrained('daily_curriculum')->onDelete('cascade');
            $table->boolean('is_completed')->default(true);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'curriculum_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_daily_progress');
        Schema::dropIfExists('daily_curriculum');
        Schema::dropIfExists('course_batches');
    }
};
