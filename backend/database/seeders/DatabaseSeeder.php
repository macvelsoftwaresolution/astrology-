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
            ['phone' => '9876543210'],
            [
                'name' => 'Demo User',
                'email' => 'user@gmail.com',
                'password' => Hash::make('123456'),
                'role' => 'user',
                'status' => 'active',
                'address' => '12 Gandhi Street, T. Nagar, Chennai - 600017'
            ]
        );

        User::updateOrCreate(
            ['email' => 'karthik@gmail.com'],
            [
                'name' => 'Karthik S',
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
                    'amount'              => 800.00,
                    'currency'            => 'INR',
                    'status'              => 'Paid',
                    'description'         => 'Prashna Astrology Consultation',
                    'created_at'          => now()->subDays(3),
                    'updated_at'          => now()->subDays(3),
                ]
            ]);
        }

        // 12. Seed Rasi Palan Predictions (All 4 categories x 12 Rasis = 48 Records)
        $today = date('Y-m-d');
        
        $categoriesData = [
            'daily' => [
                'மேஷம்'       => 'இன்று உங்களுக்கு சுப பலன்கள் அதிகரிக்கும். தொட்ட காரியங்கள் அனைத்தும் வெற்றியடையும்.',
                'ரிஷபம்'      => 'இன்று தனலாபம் உண்டு. குடும்பத்தில் மகிழ்ச்சியும் அமைதியும் நிலவும்.',
                'மிதுனம்'     => 'தொழிலில் புதிய வாய்ப்புகள் தேடி வரும். நண்பர்களின் ஆதரவு கிடைக்கும்.',
                'கடகம்'       => 'மனதில் தெளிவும் உற்சாகமும் பிறக்கும். புதிய முயற்சிகள் கைகூடும்.',
                'சிம்மம்'      => 'தொழிலில் நல்ல முன்னேற்றம் காணப்படும். சுப நிகழ்ச்சிகள் திட்டமிடுவீர்கள்.',
                'கன்னி'       => 'அலுவலகத்தில் உங்களின் உழைப்பிற்கு நல்ல அங்கீகாரம் கிடைக்கும்.',
                'துலாம்'       => 'பயணங்களால் நன்மைகள் விளையும். பணப்புழக்கம் தாராளமாக இருக்கும்.',
                'விருச்சிகம்'  => 'ஆரோக்கியத்தில் கவனம் தேவை. காரியங்களில் சிந்தித்து செயல்படவும்.',
                'தனுசு'       => 'தொழில் விரிவாக்க சிந்தனை மேலோங்கும். நல்ல லாபம் கிட்டும்.',
                'மகரம்'       => 'உறவினர்களின் ஆதரவு கிடைக்கும். தடைபட்ட காரியங்கள் நிவர்த்தியாகும்.',
                'கும்பம்'      => 'சுப செய்தி வந்து சேரும். எதிர்பார்த்த தனவரவு உண்டாகும்.',
                'மீனம்'       => 'ஆன்மீக சிந்தனை மேலோங்கும். புதிய மனிதர்களின் நட்பு கிடைக்கும்.'
            ],
            'weekly' => [
                'மேஷம்'       => 'இந்த வாரம் புதிய தொழில் முதலீடுகள் கைகூடும். குடும்பத்தில் சுப நிகழ்வுகள் நடைபெறும்.',
                'ரிஷபம்'      => 'இந்த வாரம் எதிர்பார்த்த பணவரவு தாராளமாக இருக்கும். உத்தியோகத்தில் பதவி உயர்வு கிட்டும்.',
                'மிதுனம்'     => 'இந்த வாரம் புதிய நட்பு மற்றும் தொழில் கூட்டாளிகள் அமைவார்கள். நீண்ட நாள் பிரச்சனைகள் தீரும்.',
                'கடகம்'       => 'இந்த வாரம் வீடு, மனை வாங்கும் யோகம் உண்டாகும். ஆரோக்கியத்தில் நல்ல முன்னேற்றம் ஏற்படும்.',
                'சிம்மம்'      => 'இந்த வாரம் உங்களின் செல்வாக்கு உயரும். புதிய பொறுப்புகள் தேடி வரும்.',
                'கன்னி'       => 'இந்த வாரம் வியாபாரத்தில் சிறப்பான லாபம் கிடைக்கும். உறவினர்களிடையே ஒற்றுமை பலப்படும்.',
                'துலாம்'       => 'இந்த வாரம் பணியிடத்தில் பாராட்டுகளும் எதிர்பார்த்த இடமாற்றமும் கிட்டும்.',
                'விருச்சிகம்'  => 'இந்த வாரம் திட்டமிட்ட காரியங்கள் அனைத்தும் தடையின்றி நிறைவேறும். நிதி நிலை உயரும்.',
                'தனுசு'       => 'இந்த வாரம் ஆன்மீகப் பயணங்கள் மற்றும் குடும்பத்துடன் மகிழ்ச்சியான பொழுதுபோக்குகள் அமையும்.',
                'மகரம்'       => 'இந்த வாரம் புதிய முயற்சிகளுக்கு நல்ல பலன் கிடைக்கும். எதிரிகள் விலகுவர்.',
                'கும்பம்'      => 'இந்த வாரம் நீண்ட நாட்களாக வராமல் இருந்த பாக்கிகள் வசூலாகும். சுபகாரியப் பேச்சுக்கள் நடக்கும்.',
                'மீனம்'       => 'இந்த வாரம் தொழில் கூட்டாளிகளிடம் இணக்கமான சூழல் நிலவும். வெளிநாட்டு வாய்ப்புகள் தேடி வரும்.'
            ],
            'monthly' => [
                'மேஷம்'       => 'இந்த மாதம் கிரகங்களின் சஞ்சாரம் சாதகமாக உள்ளது. நிலம் மற்றும் வாகனம் வாங்கும் யோகம் உண்டாகும்.',
                'ரிஷபம்'      => 'இந்த மாதம் வெளிநாட்டுப் பயணங்கள் மற்றும் தொழில் விரிவாக்க முயற்சிகள் வெற்றி பெறும்.',
                'மிதுனம்'     => 'இந்த மாதம் மாணவர்களுக்கு படிப்பில் சிறந்த முன்னேற்றம் காணப்படும். குடும்ப அமைதி காக்கப்படும்.',
                'கடகம்'       => 'இந்த மாதம் பொருளாதாரம் மிகச் சிறப்பாக இருக்கும். வங்கிக் கடன்கள் மற்றும் நிலுவைகள் தீரும்.',
                'சிம்மம்'      => 'இந்த மாதம் அரசு வழியில் எதிர்பார்த்த உதவிகளும் சலுகைகளும் தடையின்றி கிடைக்கும்.',
                'கன்னி'       => 'இந்த மாதம் குடும்பத்தில் சுபகாரியங்கள் இனிதே நடைபெறும். சுப விரயங்கள் ஏற்படும்.',
                'துலாம்'       => 'இந்த மாதம் புதிய தொழில் ஒப்பந்தங்கள் கையெழுத்தாகும். வருமானம் இருமடங்காக அதிகரிக்கும்.',
                'விருச்சிகம்'  => 'இந்த மாதம் உடல் ஆரோக்கியம் பலப்படும். குடும்பத்தினரின் தேவைகளை நிறைவேற்றுவீர்கள்.',
                'தனுசு'       => 'இந்த மாதம் உத்தியோகத்தில் உயர் அதிகாரிகளின் முழு ஆதரவும் ஊதிய உயர்வும் கிடைக்கும்.',
                'மகரம்'       => 'இந்த மாதம் பூர்வீக சொத்து பிரச்சனைகள் சுமூகமாக முடிவுக்கு வரும்.',
                'கும்பம்'      => 'இந்த மாதம் ஆன்மீக நாட்டம் அதிகரிக்கும். தொட்டதெல்லாம் பொன்னாகும் பொற்காலம்.',
                'மீனம்'       => 'இந்த மாதம் வியாபாரத்தில் புதிய வாடிக்கையாளர்கள் கிடைப்பார்கள். செல்வாக்கு கூடும்.'
            ],
            'yearly' => [
                'மேஷம்'       => 'இந்த ஆண்டு குரு மற்றும் சனி பெயர்ச்சியால் பெரும் நற்பலன்களும் செல்வச் செழிப்பும் உண்டாகும்.',
                'ரிஷபம்'      => 'இந்த ஆண்டு புதிய தொழில் தொடங்குதல் மற்றும் திருமண யோகம் கைகூடும் அற்புத ஆண்டாக அமையும்.',
                'மிதுனம்'     => 'இந்த ஆண்டு தொழில் மற்றும் உத்தியோகத்தில் மிகப்பெரிய திருப்புமுனைகளும் பொருளாதார முன்னேற்றமும் ஏற்படும்.',
                'கடகம்'       => 'இந்த ஆண்டு சொந்த வீடு கட்டும் கனவு நனவாகும். குழந்தைகள் வழியில் பெருமை சேரும்.',
                'சிம்மம்'      => 'இந்த ஆண்டு சமுதாயத்தில் மிக உயர்ந்த அந்தஸ்தும் கௌரவமும் கிடைக்கப்பெறும் அதிர்ஷ்ட ஆண்டு.',
                'கன்னி'       => 'இந்த ஆண்டு வெளிநாடு சென்று கல்வி பயில அல்லது பணிபுரிய விரும்பியவர்களுக்கு யோகம் கிட்டும்.',
                'துலாம்'       => 'இந்த ஆண்டு தடைபட்ட காரியங்கள் அனைத்தும் சுபமாக முடிந்து புதிய பாதை பிறக்கும்.',
                'விருச்சிகம்'  => 'இந்த ஆண்டு வியாபாரத்தில் அபார வளர்ச்சி கண்டு பல கிளைகள் தொடங்கும் யோகம் உண்டாகும்.',
                'தனுசு'       => 'இந்த ஆண்டு நிதி நிலைமை பன்மடங்கு உயர்ந்து கடன் சுமைகள் முற்றிலும் விலகும்.',
                'மகரம்'       => 'இந்த ஆண்டு உழைப்பிற்கேற்ற உன்னதமான பலன்களும் குடும்பத்தில் மகிழ்ச்சியும் பெருகும்.',
                'கும்பம்'      => 'இந்த ஆண்டு புண்ணிய காரியங்கள் செய்வீர்கள். சமூகத்தில் நற்பெயர் நிலைநாட்டப்படும்.',
                'மீனம்'       => 'இந்த ஆண்டு தொழில் ரீதியான புதிய சகாப்தம் தொடங்கும். சகல சௌபாக்கியங்களும் கிட்டும்.'
            ]
        ];

        foreach ($categoriesData as $catType => $rasiMap) {
            foreach ($rasiMap as $rasiName => $predText) {
                DB::table('rasi_palans')->updateOrInsert(
                    [
                        'prediction_date' => $today,
                        'tab_type'        => $catType,
                        'rasi_name'       => $rasiName
                    ],
                    [
                        'prediction_text' => $predText,
                        'audio_url'       => null,
                        'video_url'       => null,
                        'created_at'      => now(),
                        'updated_at'      => now()
                    ]
                );
            }
        }

        // 11. Seed App Banners
        if (DB::table('app_banners')->count() === 0) {
            DB::table('app_banners')->insert([
                [
                    'title' => 'இன்றைய ராசி பலன்',
                    'subtitle' => 'உங்கள் விதியை இன்று அறிந்து கொள்ளுங்கள்',
                    'badge' => 'இன்றைய சிறப்பு',
                    'image_url' => 'assets/images/temple_sunrise.png',
                    'link_flow' => 'rasi-palan',
                    'is_active' => true,
                    'sort_order' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'title' => 'திருமண பொருத்தம்',
                    'subtitle' => 'சிறந்த வாழ்க்கைத்துணையை தேர்ந்தெடுக்க',
                    'badge' => 'புதிய சேவை',
                    'image_url' => 'assets/images/nataraja.png',
                    'link_flow' => 'matching',
                    'is_active' => true,
                    'sort_order' => 2,
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'title' => 'ஜாதகம் எழுதுதல்',
                    'subtitle' => 'துல்லியமான ஜாதக கணிப்பு',
                    'badge' => 'ஆன்மீகம்',
                    'image_url' => 'assets/images/spiritual_education_bg.png',
                    'link_flow' => 'horoscope',
                    'is_active' => true,
                    'sort_order' => 3,
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            ]);
        }

        // 12. Seed Seminars
        if (DB::table('seminars')->count() === 0) {
            DB::table('seminars')->insert([
                [
                    'title' => 'சிறப்பு கருத்தரங்கம்: வாஸ்து சாஸ்திரம்',
                    'speaker' => 'குரு சீனிவாசன் (வேத நிபுணர்)',
                    'date_text' => 'இன்று',
                    'time_text' => 'மாலை 06:00 - 07:30',
                    'status' => 'live',
                    'join_url' => 'https://meet.google.com/xyz',
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'title' => 'ஜோதிடத்தின் அடிப்படைகள்',
                    'speaker' => 'யோக குரு ராகவன்',
                    'date_text' => 'ஞாயிறு, செப் 24',
                    'time_text' => 'மாலை 04:00 - 05:30',
                    'status' => 'upcoming',
                    'join_url' => null,
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'title' => 'தியானத்தின் ஆற்றல்',
                    'speaker' => 'முனைவர் அருண் மொழி',
                    'date_text' => 'செப் 10, 2023',
                    'time_text' => 'முடிந்தது',
                    'status' => 'past',
                    'join_url' => null,
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'title' => 'உணவே மருந்து - சித்த மருத்துவம்',
                    'speaker' => 'சித்தர் விவேக்',
                    'date_text' => 'செப் 03, 2023',
                    'time_text' => 'முடிந்தது',
                    'status' => 'past',
                    'join_url' => null,
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            ]);
        }

        // 13. Seed Course Materials / PDF Notes
        if (DB::table('course_materials')->count() === 0) {
            DB::table('course_materials')->insert([
                [
                    'course_id' => 1,
                    'title' => 'ராசி பலன் குறிப்பு & கணித முறைகள்',
                    'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    'pages_text' => '45 பக்கங்கள்',
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'course_id' => 1,
                    'title' => 'பஞ்சாங்க விளக்கம் & திதி கணிதம்',
                    'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    'pages_text' => '25 பக்கங்கள்',
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'course_id' => 1,
                    'title' => 'நவகிரக நிலைகள் & பார்வை பலன்கள்',
                    'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    'pages_text' => '12 பக்கங்கள்',
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'course_id' => 1,
                    'title' => 'யோக விளக்கங்கள் & பரிகாரங்கள்',
                    'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    'pages_text' => '34 பக்கங்கள்',
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            ]);
        }
    }
}
