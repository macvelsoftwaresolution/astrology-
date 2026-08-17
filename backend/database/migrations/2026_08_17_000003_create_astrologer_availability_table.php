<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('astrologer_availabilities')) {
            Schema::create('astrologer_availabilities', function (Blueprint $table) {
                $table->id();
                $table->date('date')->unique();
                $table->string('status')->default('busy'); // busy, holiday, event
                $table->string('reason')->nullable();      // e.g. கோவில் பூஜை, விடுப்பு
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('astrologer_availabilities');
    }
};
