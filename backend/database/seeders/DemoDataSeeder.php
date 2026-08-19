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

        // 1. Create a Course for ILANILAI
        $courseId = DB::table('courses')->insertGetId([
            'title' => 'அடிப்படை ஜோதிடம் (Basic Astrology)',
            'description' => 'கிரகங்கள் மற்றும் ராசிகளின் அறிமுகம்',
            'level' => 'ILANILAI',
            'thumbnail' => 'assets/images/astro_service_bg.png',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 2. Create Course Modules
        $moduleId1 = DB::table('course_modules')->insertGetId([
            'course_id' => $courseId,
            'title' => 'அத்தியாயம் 1: கிரகங்கள்',
            'order' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $moduleId2 = DB::table('course_modules')->insertGetId([
            'course_id' => $courseId,
            'title' => 'அத்தியாயம் 2: ராசிகள்',
            'order' => 2,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 3. Create Course Lessons (Video & Audio)
        DB::table('course_lessons')->insert([
            [
                'module_id' => $moduleId1,
                'title' => 'கிரகங்களின் அறிமுகம்',
                'description' => '9 கிரகங்கள் பற்றிய அடிப்படை விளக்கம்.',
                'content_type' => 'video',
                'content_url' => 'https://www.w3schools.com/html/mov_bbb.mp4',
                'duration' => '15:00',
                'order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'module_id' => $moduleId1,
                'title' => 'சூரியன் மற்றும் சந்திரன்',
                'description' => 'சூரியன் மற்றும் சந்திரன் காரகத்துவங்கள்.',
                'content_type' => 'audio',
                'content_url' => 'https://www.w3schools.com/html/horse.mp3',
                'duration' => '10:00',
                'order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'module_id' => $moduleId2,
                'title' => 'ராசிகளின் குணங்கள்',
                'description' => '12 ராசிகளின் அடிப்படை குணங்கள்.',
                'content_type' => 'video',
                'content_url' => 'https://www.w3schools.com/html/mov_bbb.mp4',
                'duration' => '20:00',
                'order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 4. Create an Exam for ILANILAI
        $examId = DB::table('exams')->insertGetId([
            'level' => 'ILANILAI',
            'title' => 'அடிப்படை மதிப்பீடு 1',
            'duration' => 30,
            'total_marks' => 100,
            'pass_mark' => 40,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 5. Add questions to the Exam
        DB::table('exam_questions')->insert([
            [
                'exam_id' => $examId,
                'type' => 'mcq',
                'question_text' => 'சூரியன் எந்த ராசிக்கு அதிபதி?',
                'options' => json_encode(['சிம்மம்', 'கடகம்', 'மேஷம்', 'ரிஷபம்']),
                'correct_answer' => 'சிம்மம்',
                'marks' => 20,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'exam_id' => $examId,
                'type' => 'mcq',
                'question_text' => 'ராசிகளின் மொத்த எண்ணிக்கை என்ன?',
                'options' => json_encode(['9', '12', '27', '108']),
                'correct_answer' => '12',
                'marks' => 20,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 6. Create Seminars (Live classes)
        DB::table('seminars')->insert([
            [
                'title' => 'கிரக மாற்றங்கள் மற்றும் பலன்கள்',
                'speaker' => 'Dr. ஜெக சீனிவாசன்',
                'date_text' => 'இன்று',
                'time_text' => 'மாலை 06:00 - 07:30',
                'status' => 'live',
                'join_url' => 'https://meet.google.com/abc-defg-hij',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'நட்சத்திர பலன்கள் - அறிமுகம்',
                'speaker' => 'ஜெக சீனிவாசன்',
                'date_text' => 'நாளை',
                'time_text' => 'காலை 10:00 - 11:00',
                'status' => 'upcoming',
                'join_url' => 'https://meet.google.com/xyz-uvw-hij',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        $this->command->info('Demo data seeded successfully for ILANILAI!');
    }
}
