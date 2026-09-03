<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    /**
     * Get exams based on level (Public/Admin)
     */
    public function getExams($level)
    {
        $exams = DB::table('exams')->where('level', strtoupper($level))->get();
        $examIds = $exams->pluck('id')->filter();

        if ($examIds->isNotEmpty()) {
            $questions = DB::table('exam_questions')
                ->whereIn('exam_id', $examIds)
                ->get();
            
            // For public route, we might want to hide correct_answer, 
            // but since the mobile app validates it client-side currently, we'll send it.
            $questionsGrouped = $questions->map(function($q) {
                $q->options = $q->options ? json_decode($q->options) : [];
                return $q;
            })->groupBy('exam_id');

            $examsFormatted = $exams->map(function ($exam) use ($questionsGrouped) {
                $exam->questions = $questionsGrouped->get($exam->id, collect())->values();
                return $exam;
            });
        } else {
            $examsFormatted = collect();
        }

        return response()->json([
            'success' => true,
            'exams' => $examsFormatted
        ]);
    }

    /**
     * Create an Exam (Admin)
     */
    public function storeExam(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'level' => 'nullable|string',
            'duration' => 'nullable',
            'total_marks' => 'nullable',
            'pass_mark' => 'nullable',
            'practical_prompt' => 'nullable|string',
            'chart_image_url' => 'nullable|string',
            'batch_id' => 'nullable',
        ]);

        $batchId = $request->batch_id ? (int)$request->batch_id : null;
        $duration = $request->duration ? (int)$request->duration : 60;
        $totalMarks = $request->total_marks ? (int)$request->total_marks : 100;
        $passMark = $request->pass_mark ? (int)$request->pass_mark : 40;
        $level = $request->level ? strtoupper($request->level) : 'ILANILAI';

        $examId = DB::table('exams')->insertGetId([
            'level' => $level,
            'title' => $request->title,
            'duration' => $duration,
            'total_marks' => $totalMarks,
            'pass_mark' => $passMark,
            'practical_prompt' => $request->practical_prompt ?: null,
            'chart_image_url' => $request->chart_image_url ?: null,
            'batch_id' => $batchId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Exam created successfully',
            'exam_id' => $examId
        ]);
    }

    /**
     * Update an Exam (Admin)
     */
    public function updateExam(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string',
            'duration' => 'nullable',
            'total_marks' => 'nullable',
            'pass_mark' => 'nullable',
            'practical_prompt' => 'nullable|string',
            'chart_image_url' => 'nullable|string',
            'batch_id' => 'nullable',
        ]);

        $batchId = $request->batch_id ? (int)$request->batch_id : null;
        $duration = $request->duration ? (int)$request->duration : 60;
        $totalMarks = $request->total_marks ? (int)$request->total_marks : 100;
        $passMark = $request->pass_mark ? (int)$request->pass_mark : 40;

        DB::table('exams')->where('id', $id)->update([
            'title' => $request->title,
            'duration' => $duration,
            'total_marks' => $totalMarks,
            'pass_mark' => $passMark,
            'practical_prompt' => $request->practical_prompt ?: null,
            'chart_image_url' => $request->chart_image_url ?: null,
            'batch_id' => $batchId,
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Exam updated successfully'
        ]);
    }

    /**
     * Delete an Exam (Admin)
     */
    public function destroyExam($id)
    {
        DB::table('exams')->where('id', $id)->delete();
        return response()->json([
            'success' => true,
            'message' => 'Exam deleted successfully'
        ]);
    }

    /**
     * Add Question to Exam (Admin)
     */
    public function storeQuestion(Request $request, $examId)
    {
        $request->validate([
            'question_text' => 'required|string',
            'type' => 'nullable|string',
            'correct_answer' => 'nullable|string',
            'marks' => 'nullable',
        ]);

        $type = $request->type ?: 'mcq';
        $optionsJson = null;
        if ($type === 'mcq') {
            $options = is_array($request->options) ? $request->options : (is_string($request->options) ? explode(',', $request->options) : []);
            $optionsJson = json_encode(array_values(array_filter(array_map('trim', $options))));
        }

        $marks = $request->marks ? (int)$request->marks : 10;
        $correctAnswer = $request->correct_answer ?: '';

        $questionId = DB::table('exam_questions')->insertGetId([
            'exam_id' => $examId,
            'type' => $type,
            'question_text' => $request->question_text,
            'options' => $optionsJson,
            'correct_answer' => $correctAnswer,
            'marks' => $marks,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Question added successfully',
            'question_id' => $questionId
        ]);
    }

    /**
     * Delete Question (Admin)
     */
    public function destroyQuestion($questionId)
    {
        DB::table('exam_questions')->where('id', $questionId)->delete();
        return response()->json([
            'success' => true,
            'message' => 'Question deleted successfully'
        ]);
    }

    /**
     * Import Questions from PDF (Admin)
     */
    public function importPdf(Request $request, $examId)
    {
        $request->validate([
            'file' => 'required|mimes:pdf|max:10240'
        ]);

        try {
            $parser = new \Smalot\PdfParser\Parser();
            $pdf = $parser->parseFile($request->file('file')->getPathname());
            $text = $pdf->getText();
            
            // Clean up text
            $text = str_replace("\r\n", "\n", $text);
            $text = preg_replace("/\n{2,}/", "\n", $text);
            
            $pattern = '/(?:^|\n)\d+\.\s*(?<question>.*?)(?:\n\s*[Aa]\)\s*(?<optA>.*?))(?:\n\s*[Bb]\)\s*(?<optB>.*?))(?:\n\s*[Cc]\)\s*(?<optC>.*?))(?:\n\s*[Dd]\)\s*(?<optD>.*?))(?:\n\s*Ans(?:wer)?:\s*(?<ans>[A-Da-d]))/is';
            
            preg_match_all($pattern, $text, $matches, PREG_SET_ORDER);
            
            $inserted = 0;
            
            foreach ($matches as $match) {
                $options = [
                    trim($match['optA']),
                    trim($match['optB']),
                    trim($match['optC']),
                    trim($match['optD'])
                ];
                
                $ansMap = ['A' => 0, 'B' => 1, 'C' => 2, 'D' => 3, 'a' => 0, 'b' => 1, 'c' => 2, 'd' => 3];
                $correctIndex = $ansMap[trim($match['ans'])] ?? 0;
                $correctStr = $options[$correctIndex];

                DB::table('exam_questions')->insert([
                    'exam_id' => $examId,
                    'type' => 'mcq',
                    'question_text' => trim($match['question']),
                    'options' => json_encode($options),
                    'correct_answer' => $correctStr,
                    'marks' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                $inserted++;
            }
            
            return response()->json([
                'success' => true,
                'message' => "Successfully imported {$inserted} questions."
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to parse PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import Questions from CSV (Admin)
     */
    public function importCsv(Request $request, $examId)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt|max:10240'
        ]);

        try {
            $file = $request->file('file');
            $handle = fopen($file->getPathname(), "r");
            
            $inserted = 0;
            $isFirstRow = true;
            
            while (($row = fgetcsv($handle, 10000, ",")) !== FALSE) {
                if ($isFirstRow) {
                    $isFirstRow = false;
                    // If header row, skip it
                    if (stripos($row[0], 'question') !== false || stripos($row[0], 'கேள்வி') !== false) {
                        continue;
                    }
                }

                if (count($row) < 6) continue;

                $question = trim($row[0]);
                $options = [
                    trim($row[1]),
                    trim($row[2]),
                    trim($row[3]),
                    trim($row[4])
                ];
                $ansStr = trim($row[5]);

                $ansMap = ['A' => 0, 'B' => 1, 'C' => 2, 'D' => 3, 'a' => 0, 'b' => 1, 'c' => 2, 'd' => 3, '1' => 0, '2' => 1, '3' => 2, '4' => 3];
                if (isset($ansMap[$ansStr])) {
                    $correctStr = $options[$ansMap[$ansStr]] ?? $ansStr;
                } else {
                    $correctStr = $ansStr;
                }

                if (empty($question) || empty($correctStr)) continue;

                DB::table('exam_questions')->insert([
                    'exam_id' => $examId,
                    'type' => 'mcq',
                    'question_text' => $question,
                    'options' => json_encode($options),
                    'correct_answer' => $correctStr,
                    'marks' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                $inserted++;
            }
            fclose($handle);
            
            return response()->json([
                'success' => true,
                'message' => "Successfully imported {$inserted} questions from CSV."
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to parse CSV: ' . $e->getMessage()
            ], 500);
        }
    }
}
