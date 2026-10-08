<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('astrologers') && Schema::hasColumn('astrologers', 'specialty')) {
            Schema::table('astrologers', function (Blueprint $table) {
                $table->text('specialty')->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('astrologers') && Schema::hasColumn('astrologers', 'specialty')) {
            Schema::table('astrologers', function (Blueprint $table) {
                $table->string('specialty', 255)->nullable()->change();
            });
        }
    }
};
