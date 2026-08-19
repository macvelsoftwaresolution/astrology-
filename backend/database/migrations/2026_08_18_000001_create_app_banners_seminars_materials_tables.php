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
        // 1. App Banners (Hero Carousel)
        if (!Schema::hasTable('app_banners')) {
            Schema::create('app_banners', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('subtitle')->nullable();
                $table->string('badge')->nullable();
                $table->string('image_url');
                $table->string('link_flow')->nullable();
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // 2. Seminars / Webinars
        if (!Schema::hasTable('seminars')) {
            Schema::create('seminars', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('speaker');
                $table->string('date_text');
                $table->string('time_text');
                $table->string('status')->default('upcoming'); // live, upcoming, past
                $table->string('join_url')->nullable();
                $table->timestamps();
            });
        }

        // 3. Course PDF Study Materials / Notes
        if (!Schema::hasTable('course_materials')) {
            Schema::create('course_materials', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('course_id')->nullable();
                $table->string('title');
                $table->string('file_url')->nullable();
                $table->string('pages_text')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_materials');
        Schema::dropIfExists('seminars');
        Schema::dropIfExists('app_banners');
    }
};
