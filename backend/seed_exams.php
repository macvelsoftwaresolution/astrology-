<?php

use Illuminate\Support\Facades\DB;

$examId = DB::table('exams')->insertGetId([
    'title' => 'இளநிலை ஜோதிட தேர்வு',
    'level' => 'ILANILAI',
    'duration' => 60,
    'total_marks' => 50,
    'pass_mark' => 20,
    'created_at' => now(),
    'updated_at' => now()
]);

$questions = [
    ['exam_id' => $examId, 'type' => 'mcq', 'question_text' => 'ஜோதிடத்தில் மொத்தம் எத்தனை ராசிகள் உள்ளன?', 'options' => json_encode(['9', '12', '27', '108']), 'correct_answer' => '12', 'marks' => 10, 'created_at' => now(), 'updated_at' => now()],
    ['exam_id' => $examId, 'type' => 'mcq', 'question_text' => 'நவகிரகங்களில் முதன்மையான கிரகம் எது?', 'options' => json_encode(['சந்திரன்', 'சூரியன்', 'செவ்வாய்', 'குரு']), 'correct_answer' => 'சூரியன்', 'marks' => 10, 'created_at' => now(), 'updated_at' => now()],
    ['exam_id' => $examId, 'type' => 'mcq', 'question_text' => 'ஒரு நாளுக்குரிய நட்சத்திரங்கள் எத்தனை?', 'options' => json_encode(['12', '27', '9', '7']), 'correct_answer' => '27', 'marks' => 10, 'created_at' => now(), 'updated_at' => now()],
    ['exam_id' => $examId, 'type' => 'mcq', 'question_text' => 'தனுசு ராசியின் அதிபதி யார்?', 'options' => json_encode(['சுக்கிரன்', 'குரு', 'சனி', 'சந்திரன்']), 'correct_answer' => 'குரு', 'marks' => 10, 'created_at' => now(), 'updated_at' => now()],
    ['exam_id' => $examId, 'type' => 'mcq', 'question_text' => 'ராகு காலம் எந்த கிழமையில் காலை 10:30 முதல் 12:00 வரை வரும்?', 'options' => json_encode(['வெள்ளி', 'சனி', 'திங்கள்', 'ஞாயிறு']), 'correct_answer' => 'வெள்ளி', 'marks' => 10, 'created_at' => now(), 'updated_at' => now()]
];

DB::table('exam_questions')->insert($questions);

echo "Questions added successfully!\n";
