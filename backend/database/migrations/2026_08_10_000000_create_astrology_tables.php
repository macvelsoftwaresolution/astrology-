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
        Schema::create('bookings', function (Blueprint $table) {
            $table->string('id')->primary(); // Order ID e.g., AST-2026-001
            $table->string('user_name');
            $table->string('user_phone');
            $table->string('service_type');
            $table->decimal('price', 10, 2);
            $table->string('status')->default('Pending'); // Pending, Completed, Refunded
            $table->json('details')->nullable(); // holds form models in JSON
            $table->string('chart_url')->nullable(); // PDF path or download link
            $table->timestamps();
        });

        Schema::create('rasi_palans', function (Blueprint $table) {
            $table->id();
            $table->string('rasi_name'); // மேஷம், ரிஷபம்...
            $table->string('tab_type')->default('daily'); // daily, weekly, monthly, yearly
            $table->text('prediction_text');
            $table->string('audio_url')->nullable();
            $table->date('prediction_date');
            $table->timestamps();
        });

        Schema::create('panchangams', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->string('thithi');
            $table->string('star');
            $table->string('rahukalam');
            $table->string('yamagandam');
            $table->string('nalla_neram');
            $table->timestamps();
        });

        Schema::create('astrologer_slots', function (Blueprint $table) {
            $table->id();
            $table->string('astrologer_name'); // Guru Ramajayam, Guru Srinivasan
            $table->string('slot_time'); // time duration
            $table->string('status')->default('Available'); // Available, Booked
            $table->date('date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('astrologer_slots');
        Schema::dropIfExists('panchangams');
        Schema::dropIfExists('rasi_palans');
        Schema::dropIfExists('bookings');
    }
};
