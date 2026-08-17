<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add jathagam_details & avatar_url to users table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'jathagam_details')) {
                $table->json('jathagam_details')->nullable()->after('address');
            }
            if (!Schema::hasColumn('users', 'avatar_url')) {
                $table->string('avatar_url')->nullable()->after('jathagam_details');
            }
        });

        // Add user_id FK to bookings table
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('chart_url');
            }
        });

        // Marriage Matches Table — Two-person Porutham matching
        if (!Schema::hasTable('marriage_matches')) {
            Schema::create('marriage_matches', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable(); // logged-in user who requested
                // Boy details
                $table->string('boy_name');
                $table->date('boy_dob');
                $table->string('boy_tob')->nullable();      // Time of birth
                $table->string('boy_pob')->nullable();      // Place of birth
                $table->string('boy_rasi')->nullable();
                $table->string('boy_nakshatra')->nullable();
                // Girl details
                $table->string('girl_name');
                $table->date('girl_dob');
                $table->string('girl_tob')->nullable();
                $table->string('girl_pob')->nullable();
                $table->string('girl_rasi')->nullable();
                $table->string('girl_nakshatra')->nullable();
                // Result
                $table->integer('match_score')->default(0); // 0-10 Porutham score
                $table->string('match_status')->default('No Match'); // Match / No Match
                $table->json('match_details')->nullable();  // breakdown of each porutham
                $table->timestamps();
            });
        }

        // Notifications Table — In-app notifications per user
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');      // target user
                $table->string('title');
                $table->text('body');
                $table->string('type')->default('general'); // booking_confirmed, booking_fulfilled, rasi_palan, certificate, course
                $table->boolean('is_read')->default(false);
                $table->json('data')->nullable();            // extra payload (booking_id, etc.)
                $table->timestamps();
            });
        }

        // Payment Transactions Table — Full payment ledger
        if (!Schema::hasTable('payment_transactions')) {
            Schema::create('payment_transactions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('booking_id')->nullable();   // FK to bookings.id (string PK)
                $table->string('order_type')->default('booking'); // booking | course | book
                $table->string('razorpay_order_id')->nullable();
                $table->string('razorpay_payment_id')->nullable();
                $table->decimal('amount', 10, 2);
                $table->string('currency')->default('INR');
                $table->string('status')->default('Pending'); // Pending | Paid | Failed | Refunded
                $table->string('description')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('marriage_matches');

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['jathagam_details', 'avatar_url']);
        });
    }
};
