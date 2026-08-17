<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Admin User & Student User
        $admin = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '9876543211',
                'status' => 'active'
            ]
        );

        $student = User::updateOrCreate(
            ['email' => 'karthik@gmail.com'],
            [
                'name' => 'Karthik',
                'password' => Hash::make('test123'),
                'role' => 'user',
                'phone' => '9876543212',
                'status' => 'active',
                'address' => '12 Gandhi Street, T. Nagar, Chennai - 600017'
            ]
        );

        // Remove any old superadmin user if existing
        User::where('email', 'superadmin@gmail.com')->delete();

        // 2. Seed Sample Course
        $existingCourse = DB::table('courses')->first();
        if (!$existingCourse) {
            $courseId = DB::table('courses')->insertGetId([
                'title' => 'Advanced Vedic Astrology & Jathagam Mastery (வேத ஜோதிடக் கலை)',
                'description' => 'Comprehensive masterclass covering Rasi, Nakshatras, Planets, Dasa Bhukti, and Jathagam reading.',
                'price' => 4999.00,
                'thumbnail' => 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?q=80&w=800',
                'category' => 'Astrology',
                'level' => 'Advanced',
                'status' => 'published',
                'created_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 3. Seed Modules
            $m1 = DB::table('syllabus_modules')->insertGetId([
                'course_id' => $courseId,
                'title' => 'Module 1: 12 Rasis & 27 Nakshatras Basics',
                'order_index' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $m2 = DB::table('syllabus_modules')->insertGetId([
                'course_id' => $courseId,
                'title' => 'Module 2: Planetary Aspects & Dasa Bhukti Calculation',
                'order_index' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 4. Seed Lessons
            DB::table('lessons')->insert([
                [
                    'module_id' => $m1,
                    'title' => 'Introduction to 12 Rasis & Planetary Rulers',
                    'content_type' => 'video',
                    'content_url' => 'https://www.w3schools.com/html/mov_bbb.mp4',
                    'description' => 'Video guide detailing Meshams to Meenam characteristics.',
                    'duration' => '25 mins',
                    'is_free_preview' => true,
                    'order_index' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'module_id' => $m1,
                    'title' => 'Planetary Stotram Audio Lesson',
                    'content_type' => 'audio',
                    'content_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                    'description' => 'Audio explanation of planet mantras for daily recitation.',
                    'duration' => '12 mins',
                    'is_free_preview' => false,
                    'order_index' => 2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'module_id' => $m1,
                    'title' => 'Complete Jathagam Reading Handbook (PDF Document)',
                    'content_type' => 'pdf',
                    'content_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    'description' => 'Downloadable reference handbook for Jathagam calculation.',
                    'duration' => '45 pages',
                    'is_free_preview' => false,
                    'order_index' => 3,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'module_id' => $m2,
                    'title' => 'Weekly Live Doubt Clearing & Chart Practice Session',
                    'content_type' => 'live_link',
                    'content_url' => 'https://meet.google.com/abc-defg-hij',
                    'description' => 'Live Zoom/Meet class hosted every Sunday at 10:00 AM.',
                    'duration' => 'Live 60 Mins',
                    'is_free_preview' => false,
                    'order_index' => 4,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);

            // 5. Seed Assessment
            $assessmentId = DB::table('assessments')->insertGetId([
                'course_id' => $courseId,
                'title' => 'Vedic Astrology Certification Final Exam',
                'passing_percentage' => 70,
                'questions_json' => json_encode([
                    [
                        'id' => 1,
                        'question' => 'How many Nakshatras are there in Vedic Astrology?',
                        'options' => ['12', '27', '9', '108'],
                        'correct' => 1
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 6. Seed Submissions
            DB::table('student_submissions')->insert([
                [
                    'student_id' => $student->id,
                    'course_id' => $courseId,
                    'assessment_id' => $assessmentId,
                    'submission_type' => 'pdf_upload',
                    'pdf_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    'courier_tracking_no' => null,
                    'courier_name' => null,
                    'score' => 85,
                    'status' => 'Pending',
                    'evaluator_notes' => 'Awaiting admin valuation.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);

            // 7. Seed Book Order
            DB::table('book_orders')->insert([
                'order_number' => 'ORD-BOOK-2026-881',
                'student_id' => $student->id,
                'book_title' => 'Complete Tamil Jathagam & Panchangam Reference Book (Hardcover)',
                'price' => 750.00,
                'shipping_address' => '12 Gandhi Street, T. Nagar, Chennai - 600017',
                'phone' => '9876543212',
                'status' => 'Shipped',
                'awb_number' => 'AWB-BLUEDART-449102',
                'courier_partner' => 'Blue Dart Logistics',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 8. Seed Astrology Consultations / Bookings
        $existingBooking = DB::table('bookings')->first();
        if (!$existingBooking) {
            DB::table('bookings')->insert([
                [
                    'id' => 'AST-2026-101',
                    'user_name' => 'Karthik Raja',
                    'user_phone' => '9876543212',
                    'service_type' => 'Full Jathagam Reading & Porutham Matching',
                    'price' => 1500.00,
                    'status' => 'Pending',
                    'details' => json_encode([
                        'dob' => '1998-05-14',
                        'tob' => '08:30 AM',
                        'pob' => 'Chennai',
                        'query' => 'Career growth & marriage compatibility analysis.'
                    ]),
                    'chart_url' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'id' => 'AST-2026-102',
                    'user_name' => 'Sridevi Sundaram',
                    'user_phone' => '9123456789',
                    'service_type' => 'Prashna Astrology Consultation',
                    'price' => 1000.00,
                    'status' => 'Completed',
                    'details' => json_encode([
                        'dob' => '1995-11-20',
                        'tob' => '04:15 PM',
                        'pob' => 'Madurai',
                        'query' => 'Business venture timing.'
                    ]),
                    'chart_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        // 9. Seed Marriage Matches
        if (DB::table('marriage_matches')->count() === 0) {
            DB::table('marriage_matches')->insert([
                [
                    'user_id'        => $student->id,
                    'boy_name'       => 'Karthik Raja',
                    'boy_dob'        => '1998-05-14',
                    'boy_tob'        => '08:30 AM',
                    'boy_pob'        => 'Chennai',
                    'boy_rasi'       => 'மேஷம்',
                    'boy_nakshatra'  => 'Ashwini',
                    'girl_name'      => 'Priya Kumari',
                    'girl_dob'       => '2000-07-22',
                    'girl_tob'       => '02:45 PM',
                    'girl_pob'       => 'Madurai',
                    'girl_rasi'      => 'மிதுனம்',
                    'girl_nakshatra' => 'Mrigashira',
                    'match_score'    => 7,
                    'match_status'   => 'Match',
                    'match_details'  => json_encode([
                        ['name' => 'Dinam', 'result' => 'Match', 'score' => 1],
                        ['name' => 'Ganam', 'result' => 'Match', 'score' => 1],
                        ['name' => 'Mahendram', 'result' => 'No Match', 'score' => 0],
                        ['name' => 'Stree Deergham', 'result' => 'Match', 'score' => 1],
                        ['name' => 'Yoni', 'result' => 'Match', 'score' => 1],
                        ['name' => 'Rasi', 'result' => 'Match', 'score' => 1],
                        ['name' => 'Rajju', 'result' => 'Match', 'score' => 1],
                        ['name' => 'Vedhai', 'result' => 'No Match', 'score' => 0],
                        ['name' => 'Vasiyam', 'result' => 'No Match', 'score' => 0],
                        ['name' => 'Rasi Adhipathi', 'result' => 'Match', 'score' => 1],
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        // 10. Seed Notifications
        if (DB::table('notifications')->count() === 0) {
            DB::table('notifications')->insert([
                [
                    'user_id'    => $student->id,
                    'title'      => 'Booking Confirmed! ✅',
                    'body'       => 'Your Full Jathagam Reading booking (AST-2026-101) has been received. Our astrologer will contact you within 24 hours.',
                    'type'       => 'booking_confirmed',
                    'is_read'    => false,
                    'data'       => json_encode(['booking_id' => 'AST-2026-101']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'user_id'    => $student->id,
                    'title'      => 'Today\'s Rasi Palan Published 🌟',
                    'body'       => 'Today\'s predictions for all 12 rasis are now available. Check your Mesha Rasi forecast!',
                    'type'       => 'rasi_palan',
                    'is_read'    => false,
                    'data'       => null,
                    'created_at' => now()->subHours(2),
                    'updated_at' => now()->subHours(2),
                ],
                [
                    'user_id'    => $student->id,
                    'title'      => 'Chart PDF Ready 🎉',
                    'body'       => 'Your Prashna Astrology chart has been prepared. Download it from your Appointment History.',
                    'type'       => 'booking_fulfilled',
                    'is_read'    => true,
                    'data'       => json_encode(['booking_id' => 'AST-2026-102']),
                    'created_at' => now()->subDays(1),
                    'updated_at' => now()->subDays(1),
                ]
            ]);
        }

        // 11. Seed Payment Transactions
        if (DB::table('payment_transactions')->count() === 0) {
            DB::table('payment_transactions')->insert([
                [
                    'user_id'             => $student->id,
                    'booking_id'          => 'AST-2026-101',
                    'order_type'          => 'booking',
                    'razorpay_order_id'   => 'order_PgXKMnOQtest01',
                    'razorpay_payment_id' => 'pay_PgXKtest12345',
                    'amount'              => 1500.00,
                    'currency'            => 'INR',
                    'status'              => 'Paid',
                    'description'         => 'Full Jathagam Reading & Porutham Matching',
                    'created_at'          => now(),
                    'updated_at'          => now(),
                ],
                [
                    'user_id'             => $student->id,
                    'booking_id'          => 'AST-2026-102',
                    'order_type'          => 'booking',
                    'razorpay_order_id'   => 'order_PgXKMnOQtest02',
                    'razorpay_payment_id' => 'pay_PgXKtest67890',
                    'status'              => 'Paid',
                    'description'         => 'Prashna Astrology Consultation',
                    'created_at'          => now()->subDays(3),
                    'updated_at'          => now()->subDays(3),
                ]
            ]);
        }

        // 12. Seed Rasi Palan Predictions
        $today = date('Y-m-d');
        if (DB::table('rasi_palans')->count() === 0) {
            $defaultRasis = [
                ['rasi' => 'மேஷம்', 'pred' => 'இன்று உங்களுக்கு சுப பலன்கள் அதிகரிக்கும். தொட்ட காரியங்கள் அனைத்தும் வெற்றியடையும்.'],
                ['rasi' => 'ரிஷபம்', 'pred' => 'இன்று தனலாபம் உண்டு. குடும்பத்தில் மகிழ்ச்சியும் அமைதியும் நிலவும்.'],
                ['rasi' => 'மிதுனம்', 'pred' => 'தொழிலில் புதிய வாய்ப்புகள் தேடி வரும். நண்பர்களின் ஆதரவு கிடைக்கும்.'],
                ['rasi' => 'கடகம்', 'pred' => 'மனதில் தெளிவும் உற்சாகமும் பிறக்கும். புதிய முயற்சிகள் கைகூடும்.'],
                ['rasi' => 'சிம்மம்', 'pred' => 'தொழிலில் நல்ல முன்னேற்றம் காணப்படும். சுப நிகழ்ச்சிகள் திட்டமிடுவீர்கள்.'],
                ['rasi' => 'கன்னி', 'pred' => 'அலுவலகத்தில் உங்களின் உழைப்பிற்கு நல்ல அங்கீகாரம் கிடைக்கும்.'],
                ['rasi' => 'துலாம்', 'pred' => 'பயணங்களால் நன்மைகள் விளையும். பணப்புழக்கம் தாராளமாக இருக்கும்.'],
                ['rasi' => 'விருச்சிகம்', 'pred' => 'ஆரோக்கியத்தில் கவனம் தேவை. காரியங்களில் சிந்தித்து செயல்படவும்.'],
                ['rasi' => 'தனுசு', 'pred' => 'தொழில் விரிவாக்க சிந்தனை மேலோங்கும். நல்ல லாபம் கிட்டும்.'],
                ['rasi' => 'மகரம்', 'pred' => 'உறவினர்களின் ஆதரவு கிடைக்கும். தடைபட்ட காரியங்கள் நிவர்த்தியாகும்.'],
                ['rasi' => 'கும்பம்', 'pred' => 'சுப செய்தி வந்து சேரும். எதிர்பார்த்த தனவரவு உண்டாகும்.'],
                ['rasi' => 'மீனம்', 'pred' => 'ஆன்மீக சிந்தனை மேலோங்கும். புதிய மனிதர்களின் நட்பு கிடைக்கும்.']
            ];

            foreach ($defaultRasis as $r) {
                DB::table('rasi_palans')->insert([
                    'rasi_name'       => $r['rasi'],
                    'tab_type'        => 'daily',
                    'prediction_text' => $r['pred'],
                    'audio_url'       => null,
                    'prediction_date' => $today,
                    'created_at'      => now(),
                    'updated_at'      => now()
                ]);
            }
        }
    }
}
