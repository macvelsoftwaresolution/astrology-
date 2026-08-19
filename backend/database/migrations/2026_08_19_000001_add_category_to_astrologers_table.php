<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('astrologers')) {
            if (!Schema::hasColumn('astrologers', 'category')) {
                Schema::table('astrologers', function (Blueprint $table) {
                    $table->string('category')->default('ஜாதகம் எழுதுதல்')->after('role_title');
                });
            }

            // Backfill standard categories for the default 3 astrologers
            DB::table('astrologers')->where('id', 1)->update([
                'category' => 'ஜாதகம் எழுதுதல்'
            ]);
            DB::table('astrologers')->where('id', 2)->update([
                'category' => 'வாஸ்து சாஸ்திரம்'
            ]);
            DB::table('astrologers')->where('id', 3)->update([
                'category' => 'எண்கணிதம் / நியூமராலஜி'
            ]);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('astrologers') && Schema::hasColumn('astrologers', 'category')) {
            Schema::table('astrologers', function (Blueprint $table) {
                $table->dropColumn('category');
            });
        }
    }
};
