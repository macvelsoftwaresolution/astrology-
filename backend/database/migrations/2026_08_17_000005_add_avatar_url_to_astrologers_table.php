<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('astrologers')) {
            Schema::table('astrologers', function (Blueprint $table) {
                if (!Schema::hasColumn('astrologers', 'avatar_url')) {
                    $table->longText('avatar_url')->nullable()->after('avatar_icon');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('astrologers')) {
            Schema::table('astrologers', function (Blueprint $table) {
                if (Schema::hasColumn('astrologers', 'avatar_url')) {
                    $table->dropColumn('avatar_url');
                }
            });
        }
    }
};
