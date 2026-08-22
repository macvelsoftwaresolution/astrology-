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
        $now = Carbon::now();

        // 1. Create/Update a mock course for ILANILAI
        DB::table('courses')->updateOrInsert(
            ['title' => 'அடிப்படை ஜோதிடம்', 'level' => 'ILANILAI'],
            [
                'description' => 'கிரகங்கள் மற்றும் ராசிகளின் அறிமுகம்',
                'price' => 499.00,
                'thumbnail' => 'assets/images/astro_service_bg.png',
                'category' => 'Astrology',
                'status' => 'published',
                'created_by' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );
        $courseId = DB::table('courses')->where('title', 'அடிப்படை ஜோதிடம்')->where('level', 'ILANILAI')->value('id');

        // 2. Create/Update syllabus modules
        DB::table('syllabus_modules')->updateOrInsert(
            ['course_id' => $courseId, 'title' => 'கிரகங்கள் மற்றும் ராசிகளின் அறிமுகம்'],
            ['order_index' => 1, 'created_at' => $now, 'updated_at' => $now]
        );
        $moduleId1 = DB::table('syllabus_modules')->where('course_id', $courseId)->where('title', 'கிரகங்கள் மற்றும் ராசிகளின் அறிமுகம்')->value('id');

        DB::table('syllabus_modules')->updateOrInsert(
            ['course_id' => $courseId, 'title' => 'நட்சத்திர பலன்கள்'],
            ['order_index' => 2, 'created_at' => $now, 'updated_at' => $now]
        );
        $moduleId2 = DB::table('syllabus_modules')->where('course_id', $courseId)->where('title', 'நட்சத்திர பலன்கள்')->value('id');

        // 3. Create/Update lessons
        $lessons = [
            [
                'module_id' => $moduleId1,
                'title' => 'சிவ யோகம் - அறிமுகம்',
                'content_type' => 'video',
                'content_url' => 'https://www.w3schools.com/html/mov_bbb.mp4',
                'description' => 'இப்பாடம் சிவயோகத்தின் அடிப்படை தத்துவங்கள்...',
                'duration' => '22 நிமிடங்கள்',
                'order_index' => 1,
            ],
            [
                'module_id' => $moduleId1,
                'title' => 'நட்சத்திர பலன்கள் - அறிமுகம்',
                'content_type' => 'audio',
                'content_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                'description' => 'நட்சத்திர பலன்கள் ஆடியோ விளக்கம்.',
                'duration' => '15 நிமிடங்கள்',
                'order_index' => 2,
            ],
        ];
        foreach ($lessons as $l) {
            DB::table('lessons')->updateOrInsert(
                ['module_id' => $l['module_id'], 'title' => $l['title']],
                array_merge($l, ['created_at' => $now, 'updated_at' => $now])
            );
        }

        // 4. Create/Update Seminar
        DB::table('seminars')->updateOrInsert(
            ['title' => 'நேரடி வகுப்பு - கிரக மாற்றங்கள்', 'speaker' => 'ஜெக சீனிவாசன்'],
            [
                'date_text' => 'இன்று',
                'time_text' => 'மாலை 06:00 - 07:30',
                'status' => 'live',
                'join_url' => 'https://meet.google.com/abc-defg-hij',
                'level' => 'ILANILAI',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        // 5. Create/Update Exam for ILANILAI
        DB::table('exams')->updateOrInsert(
            ['level' => 'ILANILAI', 'title' => 'Tamil'],
            [
                'duration' => 30,
                'total_marks' => 100,
                'pass_mark' => 60,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );
        $examId = DB::table('exams')->where('level', 'ILANILAI')->where('title', 'Tamil')->value('id');

        // 6. Add question to the Exam
        DB::table('exam_questions')->updateOrInsert(
            ['exam_id' => $examId, 'question_text' => 'தமிழ்நாட்டின் தலைநகரம் எது?'],
            [
                'type' => 'mcq',
                'options' => json_encode(['சென்னை', 'மதுரை', 'கோயம்புத்தூர்', 'திருச்சி']),
                'correct_answer' => 'சென்னை',
                'marks' => 10,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );
        
        $this->command->info('Mock LMS Data (Courses, Lessons, Seminars, Exams) seeded successfully!');
    }
}
