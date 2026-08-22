<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $now = Carbon::now();

        // 1. Create/Update Course for ILANILAI
        DB::table('courses')->updateOrInsert(
            ['title' => 'அடிப்படை ஜோதிடம் (Basic Astrology)', 'level' => 'ILANILAI'],
            [
                'description' => 'கிரகங்கள் மற்றும் ராசிகளின் அறிமுகம்',
                'price' => 1000.00,
                'thumbnail' => 'assets/images/astro_service_bg.png',
                'category' => 'Astrology',
                'status' => 'published',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );
        $courseId = DB::table('courses')->where('title', 'அடிப்படை ஜோதிடம் (Basic Astrology)')->where('level', 'ILANILAI')->value('id');

        // 2. Create/Update Course Modules
        DB::table('syllabus_modules')->updateOrInsert(
            ['course_id' => $courseId, 'title' => 'அத்தியாயம் 1: கிரகங்கள்'],
            ['order_index' => 1, 'created_at' => $now, 'updated_at' => $now]
        );
        $moduleId1 = DB::table('syllabus_modules')->where('course_id', $courseId)->where('title', 'அத்தியாயம் 1: கிரகங்கள்')->value('id');

        DB::table('syllabus_modules')->updateOrInsert(
            ['course_id' => $courseId, 'title' => 'அத்தியாயம் 2: ராசிகள்'],
            ['order_index' => 2, 'created_at' => $now, 'updated_at' => $now]
        );
        $moduleId2 = DB::table('syllabus_modules')->where('course_id', $courseId)->where('title', 'அத்தியாயம் 2: ராசிகள்')->value('id');

        // 3. Create/Update Course Lessons (Video & Audio)
        $lessons1 = [
            [
                'title' => 'கிரகங்களின் அறிமுகம்',
                'description' => '9 கிரகங்கள் பற்றிய அடிப்படை விளக்கம்.',
                'content_type' => 'video',
                'content_url' => 'https://www.w3schools.com/html/mov_bbb.mp4',
                'duration' => '15:00',
                'order_index' => 1,
            ],
            [
                'title' => 'சூரியன் மற்றும் சந்திரன்',
                'description' => 'சூரியன் மற்றும் சந்திரன் காரகத்துவங்கள்.',
                'content_type' => 'audio',
                'content_url' => 'https://www.w3schools.com/html/horse.mp3',
                'duration' => '10:00',
                'order_index' => 2,
            ]
        ];
        foreach ($lessons1 as $l) {
            DB::table('lessons')->updateOrInsert(
                ['module_id' => $moduleId1, 'title' => $l['title']],
                array_merge($l, ['created_at' => $now, 'updated_at' => $now])
            );
        }

        DB::table('lessons')->updateOrInsert(
            ['module_id' => $moduleId2, 'title' => 'ராசிகளின் குணங்கள்'],
            [
                'description' => '12 ராசிகளின் அடிப்படை குணங்கள்.',
                'content_type' => 'video',
                'content_url' => 'https://www.w3schools.com/html/mov_bbb.mp4',
                'duration' => '20:00',
                'order_index' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        // 4. Create/Update Exam for ILANILAI
        DB::table('exams')->updateOrInsert(
            ['level' => 'ILANILAI', 'title' => 'அடிப்படை மதிப்பீடு 1'],
            [
                'duration' => 30,
                'total_marks' => 100,
                'pass_mark' => 40,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );
        $examId = DB::table('exams')->where('level', 'ILANILAI')->where('title', 'அடிப்படை மதிப்பீடு 1')->value('id');

        // 5. Add questions to the Exam
        $questions = [
            [
                'question_text' => 'சூரியன் எந்த ராசிக்கு அதிபதி?',
                'type' => 'mcq',
                'options' => json_encode(['சிம்மம்', 'கடகம்', 'மேஷம்', 'ரிஷபம்']),
                'correct_answer' => 'சிம்மம்',
                'marks' => 20,
            ],
            [
                'question_text' => 'ராசிகளின் மொத்த எண்ணிக்கை என்ன?',
                'type' => 'mcq',
                'options' => json_encode(['9', '12', '27', '108']),
                'correct_answer' => '12',
                'marks' => 20,
            ]
        ];
        foreach ($questions as $q) {
            DB::table('exam_questions')->updateOrInsert(
                ['exam_id' => $examId, 'question_text' => $q['question_text']],
                array_merge($q, ['created_at' => $now, 'updated_at' => $now])
            );
        }

        // 6. Create Seminars
        $seminars = [
            [
                'title' => 'கிரக மாற்றங்கள் மற்றும் பலன்கள்',
                'speaker' => 'Dr. ஜெக சீனிவாசன்',
                'date_text' => 'இன்று',
                'time_text' => 'மாலை 06:00 - 07:30',
                'status' => 'live',
                'join_url' => 'https://meet.google.com/abc-defg-hij',
                'level' => 'ILANILAI',
            ],
            [
                'title' => 'நட்சத்திர பலன்கள் - அறிமுகம்',
                'speaker' => 'ஜெக சீனிவாசன்',
                'date_text' => 'நாளை',
                'time_text' => 'காலை 10:00 - 11:00',
                'status' => 'upcoming',
                'join_url' => 'https://meet.google.com/xyz-uvw-hij',
                'level' => 'ILANILAI',
            ]
        ];
        foreach ($seminars as $s) {
            DB::table('seminars')->updateOrInsert(
                ['title' => $s['title'], 'speaker' => $s['speaker']],
                array_merge($s, ['created_at' => $now, 'updated_at' => $now])
            );
        }

        $this->command->info('Demo data seeded successfully for ILANILAI!');
    }
}
