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
        if (Schema::hasTable('books')) {
            Schema::table('books', function (Blueprint $table) {
                if (!Schema::hasColumn('books', 'book_images')) {
                    $table->longText('book_images')->nullable()->after('cover_image');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('books')) {
            Schema::table('books', function (Blueprint $table) {
                if (Schema::hasColumn('books', 'book_images')) {
                    $table->dropColumn('book_images');
                }
            });
        }
    }
};
