<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LmsDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        // 1. Create/Update Courses (Levels)
        DB::table('courses')->updateOrInsert(
            ['title' => 'அடிப்படை ஜோதிடம் (Basic Astrology)', 'level' => 'ILANILAI'],
            [
                'description' => 'இளநிலை ஜோதிட பாடத்திட்டம்',
                'price' => 1000.00,
                'status' => 'published',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );
        $course1Id = DB::table('courses')->where('title', 'அடிப்படை ஜோதிடம் (Basic Astrology)')->where('level', 'ILANILAI')->value('id');

        DB::table('courses')->updateOrInsert(
            ['title' => 'மேம்பட்ட ஜோதிடம் (Advanced Astrology)', 'level' => 'MUTHUNILAI'],
            [
                'description' => 'முதுநிலை ஜோதிட பாடத்திட்டம்',
                'price' => 2000.00,
                'status' => 'published',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        // 2. Create/Update Syllabus Modules
        DB::table('syllabus_modules')->updateOrInsert(
            ['course_id' => $course1Id, 'title' => 'கிரகங்கள் மற்றும் ராசிகளின் அறிமுகம்'],
            ['order_index' => 1, 'created_at' => $now, 'updated_at' => $now]
        );
        $module1Id = DB::table('syllabus_modules')->where('course_id', $course1Id)->where('title', 'கிரகங்கள் மற்றும் ராசிகளின் அறிமுகம்')->value('id');

        DB::table('syllabus_modules')->updateOrInsert(
            ['course_id' => $course1Id, 'title' => 'நட்சத்திர பலன்கள்'],
            ['order_index' => 2, 'created_at' => $now, 'updated_at' => $now]
        );
        $module2Id = DB::table('syllabus_modules')->where('course_id', $course1Id)->where('title', 'நட்சத்திர பலன்கள்')->value('id');

        // 3. Create/Update Lessons for Module 1
        $lessons1 = [
            [
                'title' => 'நேரலை வகுப்பு - கிரக மாற்றங்கள்',
                'content_type' => 'live_link',
                'content_url' => 'https://meet.google.com/sample',
                'description' => 'இன்றைய கிரக பெயர்ச்சி மற்றும் அதன் பலன்கள்',
                'duration' => '60 mins',
                'order_index' => 1,
            ],
            [
                'title' => 'சிவ யோகம் - அறிமுகம்',
                'content_type' => 'video',
                'content_url' => 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                'description' => 'Video Lesson about Shiva Yogam',
                'duration' => '22 நிமிடங்கள்',
                'order_index' => 2,
            ]
        ];
        foreach ($lessons1 as $l) {
            DB::table('lessons')->updateOrInsert(
                ['module_id' => $module1Id, 'title' => $l['title']],
                array_merge($l, ['created_at' => $now, 'updated_at' => $now])
            );
        }

        // 4. Create/Update Lessons for Module 2
        DB::table('lessons')->updateOrInsert(
            ['module_id' => $module2Id, 'title' => 'நட்சத்திர பலன்கள் - அறிமுகம்'],
            [
                'content_type' => 'audio',
                'content_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                'description' => 'Audio lesson about Natchathira palangal',
                'duration' => '15 நிமிடங்கள்',
                'order_index' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        // 5. Create/Update Seminars
        DB::table('seminars')->updateOrInsert(
            ['title' => 'ஜோதிட ரகசியங்கள்', 'speaker' => 'ஜெக சீனிவாசன்'],
            [
                'date_text' => 'இன்று',
                'time_text' => 'mrng 06:00 - 07:30',
                'status' => 'upcoming',
                'join_url' => 'https://meet.google.com/sample',
                'level' => 'ILANILAI',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );
    }
}
