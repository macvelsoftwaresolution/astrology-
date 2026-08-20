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
        if (!Schema::hasTable('exams')) {
            Schema::create('exams', function (Blueprint $table) {
                $table->id();
                $table->string('level')->default('ILANILAI');
                $table->string('title');
                $table->integer('duration')->default(60);
                $table->integer('total_marks')->default(100);
                $table->integer('pass_mark')->default(40);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('exam_questions')) {
            Schema::create('exam_questions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('exam_id');
                $table->string('type')->default('mcq');
                $table->text('question_text');
                $table->longText('options')->nullable();
                $table->text('correct_answer');
                $table->integer('marks')->default(1);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_questions');
        Schema::dropIfExists('exams');
    }
};
