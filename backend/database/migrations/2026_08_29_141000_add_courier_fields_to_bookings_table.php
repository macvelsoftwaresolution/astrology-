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
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'shipping_address')) {
                $table->text('shipping_address')->nullable()->after('price');
            }
            if (!Schema::hasColumn('bookings', 'courier_partner')) {
                $table->string('courier_partner')->nullable()->after('status');
            }
            if (!Schema::hasColumn('bookings', 'awb_number')) {
                $table->string('awb_number')->nullable()->after('courier_partner');
            }
            if (!Schema::hasColumn('bookings', 'dispatch_date')) {
                $table->timestamp('dispatch_date')->nullable()->after('awb_number');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['shipping_address', 'courier_partner', 'awb_number', 'dispatch_date']);
        });
    }
};
