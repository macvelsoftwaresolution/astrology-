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
        Schema::table('marriage_matches', function (Blueprint $table) {
            $table->string('boy_photo')->nullable();
            $table->string('boy_jadhagam')->nullable();
            $table->string('girl_photo')->nullable();
            $table->string('girl_jadhagam')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marriage_matches', function (Blueprint $table) {
            $table->dropColumn(['boy_photo', 'boy_jadhagam', 'girl_photo', 'girl_jadhagam']);
        });
    }
};
