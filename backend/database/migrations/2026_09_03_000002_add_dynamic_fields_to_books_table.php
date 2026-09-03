<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('books')) {
            Schema::table('books', function (Blueprint $table) {
                if (!Schema::hasColumn('books', 'original_price')) {
                    $table->decimal('original_price', 10, 2)->nullable();
                }
                if (!Schema::hasColumn('books', 'is_bestseller')) {
                    $table->boolean('is_bestseller')->default(false);
                }
                if (!Schema::hasColumn('books', 'rating')) {
                    $table->decimal('rating', 3, 1)->default(5.0);
                }
                if (!Schema::hasColumn('books', 'format_label')) {
                    $table->string('format_label')->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('books')) {
            Schema::table('books', function (Blueprint $table) {
                $table->dropColumn(['original_price', 'is_bestseller', 'rating', 'format_label']);
            });
        }
    }
};
