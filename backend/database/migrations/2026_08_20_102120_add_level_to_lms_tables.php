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
        Schema::table('live_classes', function (Blueprint $table) {
            $table->string('level')->default('ILANILAI')->after('is_active');
        });
        Schema::table('seminars', function (Blueprint $table) {
            $table->string('level')->default('ILANILAI')->after('status');
        });
        Schema::table('course_materials', function (Blueprint $table) {
            $table->string('level')->default('ILANILAI')->after('pages_text');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('live_classes', function (Blueprint $table) {
            $table->dropColumn('level');
        });
        Schema::table('seminars', function (Blueprint $table) {
            $table->dropColumn('level');
        });
        Schema::table('course_materials', function (Blueprint $table) {
            $table->dropColumn('level');
        });
    }
};
