<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CourseDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('courses')->truncate();
        DB::table('syllabus_modules')->truncate();
        DB::table('lessons')->truncate();
        DB::table('assessments')->truncate();
        DB::table('seminars')->truncate();
        DB::table('course_materials')->truncate();
        Schema::enableForeignKeyConstraints();

        // 1. Create Course: Ilanilai (Diploma)
        $courseId = DB::table('courses')->insertGetId([
            'title' => 'இளநிலை ஜோதிடம் (Diploma in Astrology)',
            'description' => 'ஜோதிடத்தின் அடிப்படை கூறுகள், ராசி, நட்சத்திரங்கள், நவகிரகங்கள் பற்றிய முழுமையான ஆரம்ப நிலை கல்வி.',
            'price' => 5000.00,
            'thumbnail' => 'https://example.com/ilanilai-thumb.jpg', // Placeholder
            'category' => 'Astrology',
            'level' => 'ILANILAI',
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Create Module 1
        $module1Id = DB::table('syllabus_modules')->insertGetId([
            'course_id' => $courseId,
            'title' => 'அத்தியாயம் 1: ஜோதிட அடிப்படைகள்',
            'order_index' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Lessons for Module 1
        DB::table('lessons')->insert([
            [
                'module_id' => $module1Id,
                'title' => 'ஜோதிடம் என்றால் என்ன? (அறிமுகம்)',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Sample video link
                'description' => 'ஜோதிடத்தின் தோற்றம் மற்றும் அடிப்படை தத்துவங்கள்',
                'duration' => '45 mins',
                'is_free_preview' => true,
                'order_index' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module1Id,
                'title' => '12 ராசிகள் மற்றும் அதன் தன்மைகள் (பாடக்குறிப்பு)',
                'content_type' => 'pdf',
                'content_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Sample PDF
                'description' => 'மேஷம் முதல் மீனம் வரை 12 ராசிகளின் விவரங்கள்',
                'duration' => '10 pages',
                'is_free_preview' => true,
                'order_index' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module1Id,
                'title' => 'நேரலை வகுப்பு பதிவு (Live Class Link)',
                'content_type' => 'live_link',
                'content_url' => 'https://meet.google.com/abc-defg-hij',
                'description' => 'சந்தேகங்களை தீர்க்கும் நேரலை வகுப்பு',
                'duration' => '60 mins',
                'is_free_preview' => false,
                'order_index' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 3. Create Module 2
        $module2Id = DB::table('syllabus_modules')->insertGetId([
            'course_id' => $courseId,
            'title' => 'அத்தியாயம் 2: நட்சத்திரங்கள் மற்றும் கிரகங்கள்',
            'order_index' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Lessons for Module 2
        DB::table('lessons')->insert([
            [
                'module_id' => $module2Id,
                'title' => '27 நட்சத்திரங்கள்',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/watch?v=dummy_video',
                'description' => 'நட்சத்திரங்களின் பெயர்கள் மற்றும் அதன் பாதங்கள்',
                'duration' => '50 mins',
                'is_free_preview' => false,
                'order_index' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module2Id,
                'title' => 'நவகிரகங்களின் காரகத்துவங்கள்',
                'content_type' => 'pdf',
                'content_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'description' => 'சூரியன் முதல் கேது வரை கிரகங்களின் தன்மைகள்',
                'duration' => '15 pages',
                'is_free_preview' => false,
                'order_index' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module2Id,
                'title' => 'பயிற்சி வினாக்கள் (External Link)',
                'content_type' => 'document',
                'content_url' => 'https://docs.google.com/forms/d/e/dummy/viewform',
                'description' => 'அத்தியாயம் 2 க்கான மாதிரி தேர்வு',
                'duration' => '20 mins',
                'is_free_preview' => false,
                'order_index' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 4. Create Assessment (Exam)
        DB::table('assessments')->insert([
            'course_id' => $courseId,
            'title' => 'அத்தியாயம் 1 தேர்வு (Chapter 1 Exam)',
            'passing_percentage' => 40,
            'questions_json' => json_encode([
                ['q' => 'ஜோதிடத்தின் தந்தை யார்?', 'options' => ['பராசரர்', 'அகத்தியர்'], 'ans' => 'பராசரர்']
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 5. Create Seminars
        DB::table('seminars')->insert([
            [
                'title' => 'ஜோதிடத்தின் முக்கியத்துவம்',
                'speaker' => 'ஜெக சீனிவாசன்',
                'date_text' => '25 ஆகஸ்ட் 2026',
                'time_text' => 'மாலை 6:00 மணி',
                'status' => 'upcoming',
                'join_url' => 'https://meet.google.com/xyz',
                'level' => 'ILANILAI',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'கிரகங்களின் பெயர்ச்சி',
                'speaker' => 'ஜெக சீனிவாசன்',
                'date_text' => '20 ஆகஸ்ட் 2026',
                'time_text' => 'மாலை 5:00 மணி',
                'status' => 'past',
                'join_url' => 'https://meet.google.com/abc',
                'level' => 'ILANILAI',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 6. Create Course Materials (PDF Notes)
        DB::table('course_materials')->insert([
            [
                'course_id' => $courseId,
                'title' => '12 ராசிகளின் குணாதிசயங்கள்',
                'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'pages_text' => '25 பக்கங்கள்',
                'level' => 'ILANILAI',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => $courseId,
                'title' => 'நவகிரக தோஷங்களும் பரிகாரங்களும்',
                'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'pages_text' => '15 பக்கங்கள்',
                'level' => 'ILANILAI',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        $this->command->info('Ilanilai Course, Exams, Seminars, and PDFs seeded successfully!');
    }
}
