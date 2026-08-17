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

            // Seed default 3 Chief Astrologers
            DB::table('astrologers')->insert([
                [
                    'name' => 'குரு ஸ்ரீநிவாசன்',
                    'role_title' => 'தலைமை வேத ஜோதிடர் (Chief Vedic Astrologer)',
                    'experience' => '25+ ஆண்டுகள் அனுபவம்',
                    'specialty' => 'துல்லிய ஜாதகக் கணிப்பு, திருமணப் பொருத்தம், பிரசன்ன ஜோதிடம்',
                    'fee' => 999.00,
                    'phone' => '9840123456',
                    'bio' => 'வேத ஜோதிடக் கலை பாரம்பரிய குடும்பத்தைச் சேர்ந்தவர். ஆயிரக்கணக்கான குடும்பங்களுக்கு துல்லியமான வழிகாட்டுதல் வழங்கியுள்ளார்.',
                    'avatar_icon' => 'bi bi-person-fill',
                    'available_slots' => json_encode([
                        '10:00 AM - 11:00 AM',
                        '11:30 AM - 12:30 PM',
                        '03:30 PM - 04:30 PM',
                        '05:00 PM - 06:00 PM',
                        '06:30 PM - 07:30 PM'
                    ]),
                    'blocked_dates' => json_encode(['2026-08-23', '2026-08-30']),
                    'status' => 'Available',
                    'rating' => 4.98,
                    'consultation_count' => 2450,
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'name' => 'குரு ராமஜெயம்',
                    'role_title' => 'முதுநிலை பிரசன்ன & வாஸ்து நிபுணர் (Senior Prashna Expert)',
                    'experience' => '18+ ஆண்டுகள் அனுபவம்',
                    'specialty' => 'கேள்வி ஜோதிடம், வாஸ்து சாஸ்திரம், தோஷ நிவாரணப் பரிகாரங்கள்',
                    'fee' => 799.00,
                    'phone' => '9840654321',
                    'bio' => 'பிரசன்ன ஜோதிடம் மற்றும் வாஸ்து சாஸ்திரத்தில் ஆழமான ஞானம் கொண்டவர். எளிய பரிகாரங்கள் மூலம் தீர்வு வழங்குபவர்.',
                    'avatar_icon' => 'bi bi-person-bounding-box',
                    'available_slots' => json_encode([
                        '10:30 AM - 11:30 AM',
                        '02:00 PM - 03:00 PM',
                        '04:30 PM - 05:30 PM',
                        '07:00 PM - 08:00 PM'
                    ]),
                    'blocked_dates' => json_encode(['2026-08-23']),
                    'status' => 'Available',
                    'rating' => 4.92,
                    'consultation_count' => 1820,
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'name' => 'குரு மீனாட்சி சுந்தரம்',
                    'role_title' => 'நாடி & நியூமராலஜி வல்லுநர் (Nadi & Numerology Specialist)',
                    'experience' => '15+ ஆண்டுகள் அனுபவம்',
                    'specialty' => 'நாடி ஜோதிடம், நியூமராலஜி பெயர் அதிர்ஷ்டம், தொழில் & வியாபார யோகம்',
                    'fee' => 599.00,
                    'phone' => '9840789012',
                    'bio' => 'நாடி சுவடி வாசிப்பு மற்றும் எண்கணிதத்தில் (Numerology) தேர்ச்சி பெற்றவர். தொழில் மற்றும் வியாபார வெற்றிக்கு ஆலோசனை தருபவர்.',
                    'avatar_icon' => 'bi bi-person-badge',
                    'available_slots' => json_encode([
                        '09:00 AM - 10:00 AM',
                        '11:00 AM - 12:00 PM',
                        '03:00 PM - 04:00 PM',
                        '06:00 PM - 07:00 PM'
                    ]),
                    'blocked_dates' => json_encode(['2026-08-24']),
                    'status' => 'Available',
                    'rating' => 4.90,
                    'consultation_count' => 1240,
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('astrologers');
    }
};
