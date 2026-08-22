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
        Schema::table('astrologers', function (Blueprint $table) {
            $table->boolean('is_phone_call_available')->default(true);
            $table->decimal('phone_call_fee', 10, 2)->default(499);
            $table->boolean('is_video_call_available')->default(true);
            $table->decimal('video_call_fee', 10, 2)->default(699);
            $table->boolean('is_audio_call_available')->default(true);
            $table->decimal('audio_call_fee', 10, 2)->default(499);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('astrologers', function (Blueprint $table) {
            $table->dropColumn([
                'is_phone_call_available',
                'phone_call_fee',
                'is_video_call_available',
                'video_call_fee',
                'is_audio_call_available',
                'audio_call_fee',
            ]);
        });
    }
};
