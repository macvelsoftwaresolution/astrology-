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
        // Update users table for RBAC
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('user'); // super_admin, admin, user
            }
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable();
            }
            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status')->default('active'); // active, inactive
            }
            if (!Schema::hasColumn('users', 'address')) {
                $table->text('address')->nullable();
            }
        });

        // Courses table
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0.00);
            $table->string('thumbnail')->nullable();
            $table->string('category')->default('Astrology');
            $table->string('level')->default('Beginner'); // Beginner, Intermediate, Advanced
            $table->string('status')->default('published'); // draft, published
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Syllabus Modules
        Schema::create('syllabus_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('title');
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        // Lessons
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('syllabus_modules')->onDelete('cascade');
            $table->string('title');
            $table->string('content_type'); // video, audio, pdf, document, live_link
            $table->text('content_url')->nullable();
            $table->text('description')->nullable();
            $table->string('duration')->nullable(); // e.g. 15 mins
            $table->boolean('is_free_preview')->default(false);
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        // Quizzes / Assessments
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('title');
            $table->integer('passing_percentage')->default(60);
            $table->json('questions_json')->nullable(); // MCQ questions array
            $table->timestamps();
        });

        // Student Submissions (PDF & Courier)
        Schema::create('student_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('assessment_id')->nullable()->constrained('assessments')->onDelete('cascade');
            $table->string('submission_type'); // pdf_upload, physical_courier
            $table->string('pdf_url')->nullable();
            $table->string('courier_tracking_no')->nullable();
            $table->string('courier_name')->nullable();
            $table->integer('score')->nullable();
            $table->string('status')->default('Pending'); // Pending, Approved, Rejected
            $table->text('evaluator_notes')->nullable();
            $table->timestamps();
        });

        // Book Orders & Courier Logistics
        Schema::create('book_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('book_title');
            $table->decimal('price', 10, 2);
            $table->text('shipping_address');
            $table->string('phone');
            $table->string('status')->default('Processing'); // Processing, Packed, Shipped, Delivered
            $table->string('awb_number')->nullable();
            $table->string('courier_partner')->nullable();
            $table->timestamps();
        });

        // E-Certificates
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->string('certificate_number')->unique();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->integer('score')->default(100);
            $table->date('issue_date');
            $table->string('verification_code')->unique();
            $table->string('pdf_download_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('book_orders');
        Schema::dropIfExists('student_submissions');
        Schema::dropIfExists('assessments');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('syllabus_modules');
        Schema::dropIfExists('courses');
    }
};
