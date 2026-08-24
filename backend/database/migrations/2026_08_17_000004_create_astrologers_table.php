<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('astrologers')) {
            Schema::create('astrologers', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('role_title')->default('வேத ஜோதிடர்');
                $table->string('experience')->default('10+ ஆண்டுகள் அனுபவம்');
                $table->string('specialty')->nullable();
                $table->decimal('fee', 10, 2)->default(499);
                $table->string('phone')->nullable();
                $table->text('bio')->nullable();
                $table->string('avatar_icon')->default('bi bi-person-fill');
                $table->json('available_slots')->nullable();
                $table->json('blocked_dates')->nullable();
                $table->string('status')->default('Available'); // Available, On Leave, Busy
                $table->decimal('rating', 3, 2)->default(4.90);
                $table->integer('consultation_count')->default(500);
                $table->timestamps();
            });


        }
    }

    public function down(): void
    {
        Schema::dropIfExists('astrologers');
    }
};
