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
        Schema::table('certificates', function (Blueprint $table) {
            if (!Schema::hasColumn('certificates', 'is_published')) {
                $table->boolean('is_published')->default(false)->after('pass_status');
            }
        });

        // Set existing certificates to unpublished if their submission is not published
        DB::table('certificates')
            ->where('photo_url', 'like', '%user_avatar%')
            ->update(['photo_url' => null]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            if (Schema::hasColumn('certificates', 'is_published')) {
                $table->dropColumn('is_published');
            }
        });
    }
};
