<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MockLmsDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create a mock course for ILANILAI
        $courseId = DB::table('courses')->insertGetId([
            'title' => 'அடிப்படை ஜோதிடம்',
            'description' => 'கிரகங்கள் மற்றும் ராசிகளின் அறிமுகம்',
            'price' => 499.00,
            'thumbnail' => 'assets/images/astro_service_bg.png',
            'category' => 'Astrology',
            'level' => 'ILANILAI',
            'status' => 'published',
            'created_by' => 1,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // 2. Create syllabus modules
        $moduleId1 = DB::table('syllabus_modules')->insertGetId([
            'course_id' => $courseId,
            'title' => 'கிரகங்கள் மற்றும் ராசிகளின் அறிமுகம்',
            'order_index' => 1,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $moduleId2 = DB::table('syllabus_modules')->insertGetId([
            'course_id' => $courseId,
            'title' => 'நட்சத்திர பலன்கள்',
            'order_index' => 2,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // 3. Create lessons
        // Module 1 Lessons
        DB::table('lessons')->insert([
            [
                'module_id' => $moduleId1,
                'title' => 'சிவ யோகம் - அறிமுகம்',
                'content_type' => 'video',
                'content_url' => 'https://www.w3schools.com/html/mov_bbb.mp4',
                'description' => 'இப்பாடம் சிவயோகத்தின் அடிப்படை தத்துவங்கள்...',
                'duration' => '22 நிமிடங்கள்',
                'order_index' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'module_id' => $moduleId1,
                'title' => 'நட்சத்திர பலன்கள் - அறிமுகம்',
                'content_type' => 'audio',
                'content_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                'description' => 'நட்சத்திர பலன்கள் ஆடியோ விளக்கம்.',
                'duration' => '15 நிமிடங்கள்',
                'order_index' => 2,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);

        // 4. Create Seminar (Live Class)
        DB::table('seminars')->insert([
            'title' => 'நேரடி வகுப்பு - கிரக மாற்றங்கள்',
            'speaker' => 'ஜெக சீனிவாசன்',
            'date_text' => 'இன்று',
            'time_text' => 'மாலை 06:00 - 07:30',
            'status' => 'live',
            'join_url' => 'https://meet.google.com/abc-defg-hij',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // 5. Create Exam for ILANILAI
        $examId = DB::table('exams')->insertGetId([
            'level' => 'ILANILAI',
            'title' => 'Tamil',
            'duration' => 30,
            'total_marks' => 100,
            'pass_mark' => 60,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // 6. Add some mock questions to the Exam
        DB::table('exam_questions')->insert([
            [
                'exam_id' => $examId,
                'type' => 'mcq',
                'question_text' => 'தமிழ்நாட்டின் தலைநகரம் எது?',
                'options' => json_encode(['சென்னை', 'மதுரை', 'கோயம்புத்தூர்', 'திருச்சி']),
                'correct_answer' => 'சென்னை',
                'marks' => 10,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        ]);
        
        $this->command->info('Mock LMS Data (Courses, Lessons, Seminars, Exams) seeded successfully!');
    }
}
