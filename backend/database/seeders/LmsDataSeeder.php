<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LmsDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Clear existing specific LMS data if needed, but for now just insert safely
        DB::table('lessons')->delete();
        DB::table('syllabus_modules')->delete();
        DB::table('courses')->delete();
        DB::table('seminars')->delete();

        // 2. Create Courses (Levels)
        $course1Id = DB::table('courses')->insertGetId([
            'title' => 'அடிப்படை ஜோதிடம் (Basic Astrology)',
            'description' => 'இளநிலை ஜோதிட பாடத்திட்டம்',
            'price' => 1000.00,
            'level' => 'ILANILAI',
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $course2Id = DB::table('courses')->insertGetId([
            'title' => 'மேம்பட்ட ஜோதிடம் (Advanced Astrology)',
            'description' => 'முதுநிலை ஜோதிட பாடத்திட்டம்',
            'price' => 2000.00,
            'level' => 'MUTHUNILAI',
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Create Syllabus Modules
        $module1Id = DB::table('syllabus_modules')->insertGetId([
            'course_id' => $course1Id,
            'title' => 'கிரகங்கள் மற்றும் ராசிகளின் அறிமுகம்',
            'order_index' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $module2Id = DB::table('syllabus_modules')->insertGetId([
            'course_id' => $course1Id,
            'title' => 'நட்சத்திர பலன்கள்',
            'order_index' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. Create Lessons for Module 1
        DB::table('lessons')->insert([
            [
                'module_id' => $module1Id,
                'title' => 'நேரலை வகுப்பு - கிரக மாற்றங்கள்',
                'content_type' => 'live_link',
                'content_url' => 'https://meet.google.com/sample',
                'description' => 'இன்றைய கிரக பெயர்ச்சி மற்றும் அதன் பலன்கள்',
                'duration' => '60 mins',
                'order_index' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module1Id,
                'title' => 'சிவ யோகம் - அறிமுகம்',
                'content_type' => 'video',
                'content_url' => 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                'description' => 'Video Lesson about Shiva Yogam',
                'duration' => '22 நிமிடங்கள்',
                'order_index' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 5. Create Lessons for Module 2
        DB::table('lessons')->insert([
            [
                'module_id' => $module2Id,
                'title' => 'நட்சத்திர பலன்கள் - அறிமுகம்',
                'content_type' => 'audio',
                'content_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                'description' => 'Audio lesson about Natchathira palangal',
                'duration' => '15 நிமிடங்கள்',
                'order_index' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 6. Create Seminars
        DB::table('seminars')->insert([
            [
                'title' => 'ஜோதிட ரகசியங்கள்',
                'speaker' => 'ஜெக சீனிவாசன்',
                'date_text' => 'இன்று',
                'time_text' => 'mrng 06:00 - 07:30',
                'status' => 'upcoming',
                'join_url' => 'https://meet.google.com/sample',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
