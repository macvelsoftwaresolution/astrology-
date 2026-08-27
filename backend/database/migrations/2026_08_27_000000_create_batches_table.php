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
        // Batches Table
        if (!Schema::hasTable('batches')) {
            Schema::create('batches', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // e.g. "Batch 1 (Jan - Mar 2026)"
                $table->string('batch_code')->nullable()->unique(); // e.g. "2026-B1"
                $table->string('course_level')->default('all'); // ilanilai, mudhunilai, all
                $table->date('start_date')->nullable();
                $table->date('end_date')->nullable();
                $table->string('status')->default('active'); // upcoming, active, completed, closed
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        // Add batch_id to users table if not present
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'batch_id')) {
                $table->foreignId('batch_id')->nullable()->constrained('batches')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'batch_id')) {
                $table->dropForeign(['batch_id']);
                $table->dropColumn('batch_id');
            }
        });

        Schema::dropIfExists('batches');
    }
};
