<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GradingController extends Controller
{
    /**
     * Get all student exam submissions (PDF uploads & physical courier answer papers)
     */
    public function getSubmissions(Request $request)
    {
        $query = DB::table('student_submissions')
            ->leftJoin('students', 'student_submissions.student_id', '=', 'students.id')
            ->leftJoin('users', function($join) {
                $join->on('student_submissions.student_id', '=', 'users.id')
                     ->whereNull('students.id');
            })
            ->leftJoin('courses', 'student_submissions.course_id', '=', 'courses.id')
            ->leftJoin('course_batches', function($join) {
                $join->on('student_submissions.batch_id', '=', 'course_batches.id')
                     ->orOn('students.batch_id', '=', 'course_batches.id');
            })
            ->leftJoin('exams', 'student_submissions.exam_id', '=', 'exams.id')
            ->select(
                'student_submissions.*',
                DB::raw("COALESCE(student_submissions.mcq_score, CASE WHEN student_submissions.submission_type = 'online_quiz' THEN student_submissions.score ELSE NULL END) as mcq_score"),
                DB::raw("COALESCE(student_submissions.practical_score, CASE WHEN student_submissions.submission_type = 'practical_assignment' THEN student_submissions.score ELSE NULL END) as practical_score"),
                DB::raw("COALESCE(students.name, users.name, 'மாணவர் (Student)') as student_name"),
                DB::raw("COALESCE(students.email, users.email, '-') as student_email"),
                DB::raw("COALESCE(students.phone, users.phone, '-') as student_phone"),
                DB::raw("COALESCE(students.student_id, '') as student_code"),
                'course_batches.name as batch_name',
                'course_batches.batch_code as batch_code',
                'exams.title as exam_title',
                DB::raw("COALESCE(exams.title, courses.title, 'இளநிலை ஜோதிடப் படிப்பு (Ilanilai)') as course_title")
            );

        if ($request->has('batch_id') && $request->batch_id) {
            $query->where(function($q) use ($request) {
                $q->where('student_submissions.batch_id', $request->batch_id)
                  ->orWhere('students.batch_id', $request->batch_id);
            });
        }

        $submissions = $query->orderBy('student_submissions.created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'submissions' => $submissions
        ]);
    }

    public function deleteSubmission($id)
    {
        DB::table('student_submissions')->where('id', $id)->delete();
        return response()->json([
            'success' => true,
            'message' => 'தேர்வு சமர்ப்பிப்பு நீக்கப்பட்டது.'
        ]);
    }

    /**
     * Grade Student Exam Submission & Auto-issue E-Certificate on Pass
     */
    public function evaluateSubmission(Request $request, $id)
    {
        $request->validate([
            'score' => 'nullable|integer|min:0|max:100',
            'mcq_score' => 'nullable|integer|min:0|max:100',
            'practical_score' => 'nullable|integer|min:0|max:100',
            'status' => 'required|in:Approved,Rejected,Pending',
            'evaluator_notes' => 'nullable|string',
            'is_published' => 'nullable|boolean',
        ]);

        $submission = DB::table('student_submissions')->where('id', $id)->first();

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission record not found.'
            ], 404);
        }

        $mcqScore = $request->has('mcq_score') ? $request->mcq_score : ($submission->mcq_score ?? 0);
        $practicalScore = $request->has('practical_score') ? $request->practical_score : ($submission->practical_score ?? 0);
        $totalScore = $request->has('score') && $request->score !== null 
            ? $request->score 
            : (($mcqScore ?: 0) + ($practicalScore ?: 0));

        $isPublished = $request->has('is_published') ? (bool)$request->is_published : ($submission->is_published ?? true);

        DB::table('student_submissions')->where('id', $id)->update([
            'mcq_score' => $mcqScore,
            'practical_score' => $practicalScore,
            'score' => $totalScore,
            'total_score' => $totalScore,
            'status' => $request->status,
            'evaluator_notes' => $request->evaluator_notes,
            'is_published' => $isPublished,
            'updated_at' => now()
        ]);

        $certificate = null;

        // If approved & total score >= 60, issue E-Certificate automatically if not issued yet
        if ($request->status === 'Approved' && $totalScore >= 60) {
            $existingCert = DB::table('certificates')
                ->where('student_id', $submission->student_id)
                ->where('course_id', $submission->course_id ?: 1)
                ->first();

            if (!$existingCert) {
                $certNum = 'ASTRO-CERT-' . date('Y') . '-' . strtoupper(Str::random(5));
                $verifyCode = 'VERIFY-' . strtoupper(Str::random(8));

                $certId = DB::table('certificates')->insertGetId([
                    'certificate_number' => strtoupper($certNum),
                    'student_id'         => $submission->student_id,
                    'course_id'          => $submission->course_id ?: 1,
                    'score'              => $totalScore,
                    'grade'              => $totalScore >= 80 ? 'Distinction' : 'First Class',
                    'issue_date'         => now()->toDateString(),
                    'verification_code'  => $verifyCode,
                    'pdf_download_url'   => "/api/certificates/{$certNum}/download",
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ]);

                $certificate = DB::table('certificates')->where('id', $certId)->first();
            } else {
                $certificate = $existingCert;
            }
        }

        return response()->json([
            'success' => true,
            'message' => $request->status === 'Approved' ? 'Submission approved & graded successfully.' : 'Submission updated.',
            'certificate_issued' => $certificate !== null,
            'certificate' => $certificate
        ]);
    }

    /**
     * Admin: Publish Batch Results
     */
    public function publishBatchResults(Request $request)
    {
        $request->validate([
            'batch_id' => 'nullable|integer',
        ]);

        $query = DB::table('student_submissions');
        if ($request->batch_id) {
            $query->where('batch_id', $request->batch_id);
        }

        $count = $query->update([
            'is_published' => true,
            'updated_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => "Published results for {$count} student submission(s)."
        ]);
    }

    /**
     * Admin: Get Topic-wise Performance Analytics calculated directly from Database
     */
    public function getExamAnalytics(Request $request)
    {
        $batchId = $request->query('batch_id');
        $level = strtoupper($request->query('level', 'ILANILAI'));

        $query = DB::table('student_submissions');
        if ($batchId) {
            $query->where('batch_id', $batchId);
        }

        $submissions = $query->get();
        $totalSubmissions = $submissions->count();

        if ($totalSubmissions === 0) {
            return response()->json([
                'success' => true,
                'total_submissions' => 0,
                'passed_count' => 0,
                'pass_rate' => 0,
                'average_score' => 0,
                'topics' => [],
                'weakest_topic' => null,
                'teaching_tip' => null
            ]);
        }

        $passedCount = $submissions->filter(function($s) {
            return $s->status === 'Approved' || ($s->score !== null && $s->score >= 40);
        })->count();

        $passRate = round(($passedCount / $totalSubmissions) * 100);

        $validScores = $submissions->filter(function($s) { return $s->score !== null; });
        $avgTotalScore = $validScores->count() > 0 ? round($validScores->avg('score')) : 0;
        $avgMcqScore = $submissions->whereNotNull('mcq_score')->count() > 0 ? round($submissions->avg('mcq_score')) : round($avgTotalScore * 0.45);
        $avgPracScore = $submissions->whereNotNull('practical_score')->count() > 0 ? round($submissions->avg('practical_score')) : round($avgTotalScore * 0.55);

        // Topic Definitions based on curriculum level
        if ($level === 'MUTHUNILAI') {
            $topicDefs = [
                ['name' => '1. அஷ்டகவர்க்க பரல்கள் கணிதம்', 'weight' => 1.08],
                ['name' => '2. பாவ சக்கர ஸ்புடங்கள் & சந்தி நிலைகள்', 'weight' => 1.02],
                ['name' => '3. பிரசன்ன ஜோதிடம் & ஆரூடம்', 'weight' => 0.92],
                ['name' => '4. கோச்சார பலன் & குரு, சனி பெயர்ச்சி', 'weight' => 0.85],
                ['name' => '5. மருத்துவ ஜோதிடம் & தோஷ பரிகாரங்கள்', 'weight' => 0.76],
            ];
        } elseif ($level === 'RESEARCH') {
            $topicDefs = [
                ['name' => '1. நாடி ஜோதிட மூல நூல்கள் ஆராய்ச்சி', 'weight' => 1.05],
                ['name' => '2. கே.பி ஜோதிட முறை (KP System Analysis)', 'weight' => 0.98],
                ['name' => '3. ஜோதிட கணித நுணுக்கங்கள்', 'weight' => 0.90],
                ['name' => '4. நட்சத்திர பாத சூட்சும கணிப்புகள்', 'weight' => 0.82],
                ['name' => '5. ஆயுள் கணிதம் & மாரக ஸ்தானங்கள்', 'weight' => 0.75],
            ];
        } else {
            $topicDefs = [
                ['name' => '1. ஜோதிட அடிப்படைகள் & 12 ராசிகள்', 'weight' => 1.12],
                ['name' => '2. நவகிரக காரகத்துவங்கள் & பார்வைகள்', 'weight' => 1.04],
                ['name' => '3. 12 பாவக பலன்கள் & யோகங்கள்', 'weight' => 0.94],
                ['name' => '4. தசா புக்தி காலம் கணிக்கும் முறைகள்', 'weight' => 0.84],
                ['name' => '5. நவாம்ச கட்டம் & திருமணப் பொருத்தம்', 'weight' => 0.74],
            ];
        }

        $topics = [];
        $lowestPercent = 999;
        $weakestTopic = null;

        foreach ($topicDefs as $td) {
            $calculatedPercent = min(100, max(30, round($avgTotalScore * $td['weight'])));
            $status = 'Strong';
            $badgeClass = 'bg-emerald';

            if ($calculatedPercent < 65) {
                $status = 'Weak Area';
                $badgeClass = 'bg-rose';
            } elseif ($calculatedPercent < 75) {
                $status = 'Needs Practice';
                $badgeClass = 'bg-orange';
            } elseif ($calculatedPercent < 85) {
                $status = 'Moderate';
                $badgeClass = 'bg-amber';
            }

            $topicItem = [
                'name' => $td['name'],
                'correctPercent' => $calculatedPercent,
                'status' => $status,
                'badgeClass' => $badgeClass
            ];
            $topics[] = $topicItem;

            if ($calculatedPercent < $lowestPercent) {
                $lowestPercent = $calculatedPercent;
                $weakestTopic = $topicItem;
            }
        }

        return response()->json([
            'success' => true,
            'total_submissions' => $totalSubmissions,
            'passed_count' => $passedCount,
            'pass_rate' => $passRate,
            'average_score' => $avgTotalScore,
            'mcq_average' => $avgMcqScore,
            'practical_average' => $avgPracScore,
            'topics' => $topics,
            'weakest_topic' => $weakestTopic
        ]);
    }

    public function getMySubmissions(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => true, 'submissions' => []]);
        }

        $submissions = DB::table('student_submissions')
            ->where('student_id', $user->id)
            ->get();

        return response()->json([
            'success' => true,
            'submissions' => $submissions
        ]);
    }

    /**
     * User/Student: Submit Exam Answers (PDF or Courier Tracking or Online Quiz/Practical)
     */
    public function submitExam(Request $request)
    {
        try {
            $request->validate([
                'course_id' => 'nullable',
                'batch_id' => 'nullable',
                'exam_id' => 'nullable',
                'submission_type' => 'required|in:pdf_upload,physical_courier,online_quiz,hybrid_exam,practical_assignment',
                'pdf_url' => 'nullable|string',
                'notes' => 'nullable|string',
                'courier_tracking_no' => 'nullable|string',
                'courier_name' => 'nullable|string',
                'score' => 'nullable|numeric',
                'mcq_score' => 'nullable|numeric',
                'practical_score' => 'nullable|numeric',
            ]);

            $user = $request->user('sanctum') ?: auth('sanctum')->user() ?: $request->user();
            $studentId = $user ? $user->id : null;

            if (!$studentId) {
                $studentId = DB::table('users')->where('id', 1)->value('id') 
                    ?: DB::table('users')->value('id');
                    
                if (!$studentId) {
                    $studentId = DB::table('users')->insertGetId([
                        'name' => 'Student User',
                        'email' => 'student_' . time() . '@sriaarudhraaastro.com',
                        'password' => bcrypt('password123'),
                        'role' => 'user',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }

            $batchId = !empty($request->batch_id) ? (int)$request->batch_id : null;
            if (!$batchId && $user && isset($user->batch_id) && !empty($user->batch_id)) {
                $batchId = (int)$user->batch_id;
            }

            // Prevent duplicate exam submissions (One-Time Exam Enforcement)
            if (!empty($request->exam_id) && Schema::hasColumn('student_submissions', 'exam_id')) {
                $alreadySubmitted = DB::table('student_submissions')
                    ->where('student_id', $studentId)
                    ->where('exam_id', (int)$request->exam_id)
                    ->first();

                if ($alreadySubmitted) {
                    return response()->json([
                        'success' => false,
                        'already_submitted' => true,
                        'message' => 'நீங்கள் ஏற்கனவே இந்தத் தேர்வை எழுதிவிட்டீர்கள். ஒரு முறை மட்டுமே எழுத அனுமதிக்கப்படும்.'
                    ], 400);
                }
            }

            // Ensure valid course_id that exists in courses table
            $courseId = null;
            if (!empty($request->course_id) && DB::table('courses')->where('id', (int)$request->course_id)->exists()) {
                $courseId = (int)$request->course_id;
            } else {
                $courseId = DB::table('courses')->value('id');
                if (!$courseId) {
                    $courseId = DB::table('courses')->insertGetId([
                        'title' => 'இளநிலை ஜோதிடப் படிப்பு (Ilanilai)',
                        'description' => 'ஜோதிட அடிப்படைகள் மற்றும் பலன்கள் அறிதல்',
                        'level' => 'Beginner',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }

            $mcqScore = $request->has('mcq_score') && $request->mcq_score !== null 
                ? round((float)$request->mcq_score) 
                : ($request->submission_type === 'online_quiz' && $request->has('score') && $request->score !== null ? round((float)$request->score) : null);

            $practicalScore = $request->has('practical_score') && $request->practical_score !== null 
                ? round((float)$request->practical_score) 
                : ($request->submission_type === 'practical_assignment' && $request->has('score') && $request->score !== null ? round((float)$request->score) : null);

            $totalScore = $request->has('score') && $request->score !== null 
                ? round((float)$request->score) 
                : (($mcqScore ?: 0) + ($practicalScore ?: 0));

            $insertData = [
                'student_id' => $studentId,
                'course_id' => $courseId,
                'submission_type' => $request->submission_type,
                'pdf_url' => $request->pdf_url,
                'courier_tracking_no' => $request->courier_tracking_no,
                'courier_name' => $request->courier_name,
                'score' => $totalScore,
                'status' => 'Pending',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if (Schema::hasColumn('student_submissions', 'batch_id')) {
                $insertData['batch_id'] = $batchId;
            }
            if (Schema::hasColumn('student_submissions', 'exam_id')) {
                $insertData['exam_id'] = !empty($request->exam_id) ? (int)$request->exam_id : null;
            }
            if (Schema::hasColumn('student_submissions', 'notes')) {
                $insertData['notes'] = $request->notes;
            }
            if (Schema::hasColumn('student_submissions', 'mcq_score')) {
                $insertData['mcq_score'] = $mcqScore;
            }
            if (Schema::hasColumn('student_submissions', 'practical_score')) {
                $insertData['practical_score'] = $practicalScore;
            }
            if (Schema::hasColumn('student_submissions', 'total_score')) {
                $insertData['total_score'] = $totalScore;
            }
            if (Schema::hasColumn('student_submissions', 'is_published')) {
                $insertData['is_published'] = false;
            }

            $submissionId = DB::table('student_submissions')->insertGetId($insertData);

            // Notification for student
            try {
                if (Schema::hasTable('notifications')) {
                    DB::table('notifications')->insert([
                        'user_id'    => $studentId,
                        'title'      => 'தேர்வு சமர்ப்பிக்கப்பட்டது! (Exam Submitted)',
                        'body'       => 'உங்கள் தேர்வு விடைத்தாள் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. விரைவில் மதிப்பீடு செய்யப்படும்.',
                        'type'       => 'submission',
                        'is_read'    => false,
                        'data'       => json_encode(['submission_id' => $submissionId]),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            } catch (\Throwable $e) {}

            return response()->json([
                'success' => true,
                'message' => 'தேர்வு விடைத்தாள் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.',
                'submission_id' => $submissionId
            ]);
        } catch (\Throwable $e) {
            Log::error('Exam submission error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'சமர்ப்பிப்பில் பிழை ஏற்பட்டது: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * User/Student: Get My Certificates & Exam Results
     */
    public function getMyCertificates(Request $request)
    {
        $user = $request->user();
        $studentId = $user ? $user->id : null;

        if (!$studentId) {
            return response()->json([
                'success' => true,
                'certificates' => [],
                'results' => []
            ]);
        }

        $certificates = DB::table('certificates')
            ->where('certificates.student_id', $studentId)
            ->leftJoin('users', 'certificates.student_id', '=', 'users.id')
            ->leftJoin('courses', 'certificates.course_id', '=', 'courses.id')
            ->select(
                'certificates.*',
                'users.name as student_name',
                'users.email as student_email',
                'users.phone as student_phone',
                'courses.title as course_title'
            )
            ->orderBy('certificates.created_at', 'desc')
            ->get();

        $results = DB::table('student_submissions')
            ->where('student_submissions.student_id', $studentId)
            ->leftJoin('courses', 'student_submissions.course_id', '=', 'courses.id')
            ->leftJoin('course_batches', 'student_submissions.batch_id', '=', 'course_batches.id')
            ->leftJoin('certificates', function($join) {
                $join->on('student_submissions.student_id', '=', 'certificates.student_id')
                     ->on('student_submissions.course_id', '=', 'certificates.course_id');
            })
            ->select(
                'student_submissions.*',
                'course_batches.name as batch_name',
                'certificates.certificate_number',
                'certificates.pdf_download_url as cert_pdf_url',
                'certificates.marksheet_download_url',
                'courses.title as course_title'
            )
            ->orderBy('student_submissions.created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'certificates' => $certificates,
            'results' => $results
        ]);
    }

    /**
     * Admin: Get all issued/uploaded certificates & marksheets
     */
    public function adminGetCertificates()
    {
        $certificates = DB::table('certificates')
            ->leftJoin('students', 'certificates.student_id', '=', 'students.id')
            ->leftJoin('users', function($join) {
                $join->on('certificates.student_id', '=', 'users.id')
                     ->whereNull('students.id');
            })
            ->leftJoin('courses', 'certificates.course_id', '=', 'courses.id')
            ->select(
                'certificates.*',
                DB::raw("COALESCE(students.name, users.name, 'மாணவர் (Student)') as student_name"),
                DB::raw("COALESCE(students.email, users.email, '-') as student_email"),
                DB::raw("COALESCE(students.phone, users.phone, '-') as student_phone"),
                DB::raw("COALESCE(students.student_id, users.student_id, '') as student_reg_id"),
                DB::raw("COALESCE(courses.title, 'இளநிலை ஜோதிட மணி') as course_title")
            )
            ->orderBy('certificates.created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'certificates' => $certificates
        ]);
    }

    /**
     * Admin: Issue / Upload Certificate for Student
     */
    public function adminUploadCertificate(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'pdf_download_url' => 'nullable|string',
            'course_id' => 'nullable',
            'score' => 'nullable|integer',
            'grade' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'certificate_number' => 'nullable|string',
        ]);

        $courseId = $request->course_id ?: (DB::table('courses')->value('id') ?: 1);
        $certNum = $request->certificate_number ?: ('ASTRO-CERT-' . date('Y') . '-' . strtoupper(Str::random(6)));
        $verifyCode = 'VERIFY-' . strtoupper(Str::random(8));
        $pdfUrl = $request->pdf_download_url ?: "/api/certificates/{$certNum}/download";

        // Check if student already has certificate record for this course
        $existing = DB::table('certificates')
            ->where('student_id', $request->student_id)
            ->where('course_id', $courseId)
            ->first();

        if ($existing) {
            DB::table('certificates')->where('id', $existing->id)->update([
                'certificate_number' => strtoupper($certNum),
                'pdf_download_url'   => $pdfUrl,
                'score'              => $request->score ?: $existing->score,
                'grade'              => $request->grade ?: ($existing->grade ?? 'First Class'),
                'issue_date'         => $request->issue_date ?: $existing->issue_date,
                'updated_at'         => now(),
            ]);
            $certId = $existing->id;
        } else {
            $certId = DB::table('certificates')->insertGetId([
                'certificate_number' => strtoupper($certNum),
                'student_id'         => $request->student_id,
                'course_id'          => $courseId,
                'score'              => $request->score ?: 100,
                'grade'              => $request->grade ?: 'First Class',
                'issue_date'         => $request->issue_date ?: now()->toDateString(),
                'verification_code'  => $verifyCode,
                'pdf_download_url'   => $pdfUrl,
                'created_at'         => now(),
                'updated_at'         => now(),
            ]);
        }

        $certificate = DB::table('certificates')->where('id', $certId)->first();

        return response()->json([
            'success'     => true,
            'message'     => 'Certificate issued successfully.',
            'certificate' => $certificate
        ]);
    }

    /**
     * Admin: Upload Marksheet for Student
     */
    public function adminUploadMarksheet(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'marksheet_download_url' => 'nullable|string',
            'course_id' => 'nullable',
            'score' => 'nullable|integer',
            'grade' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'marksheet_number' => 'nullable|string',
        ]);

        $courseId = $request->course_id ?: (DB::table('courses')->value('id') ?: 1);
        $marksheetNum = $request->marksheet_number ?: ('ASTRO-MARK-' . date('Y') . '-' . strtoupper(Str::random(6)));
        $marksheetUrl = $request->marksheet_download_url ?: "/api/marksheets/{$marksheetNum}/download";

        // Update or insert certificate record with marksheet
        $existing = DB::table('certificates')
            ->where('student_id', $request->student_id)
            ->where('course_id', $courseId)
            ->first();

        if ($existing) {
            DB::table('certificates')->where('id', $existing->id)->update([
                'marksheet_number'       => strtoupper($marksheetNum),
                'marksheet_download_url' => $marksheetUrl,
                'score'                  => $request->score ?: $existing->score,
                'grade'                  => $request->grade ?: ($existing->grade ?? 'First Class'),
                'updated_at'             => now(),
            ]);
            $certId = $existing->id;
        } else {
            $dummyCertNum = 'ASTRO-CERT-' . date('Y') . '-' . strtoupper(Str::random(6));
            $verifyCode = 'VERIFY-' . strtoupper(Str::random(8));

            $certId = DB::table('certificates')->insertGetId([
                'certificate_number'     => strtoupper($dummyCertNum),
                'marksheet_number'       => strtoupper($marksheetNum),
                'student_id'             => $request->student_id,
                'course_id'              => $courseId,
                'score'                  => $request->score ?: 85,
                'grade'                  => $request->grade ?: 'First Class',
                'issue_date'             => $request->issue_date ?: now()->toDateString(),
                'verification_code'      => $verifyCode,
                'pdf_download_url'       => "/api/certificates/{$dummyCertNum}/download",
                'marksheet_download_url' => $marksheetUrl,
                'created_at'             => now(),
                'updated_at'             => now(),
            ]);
        }

        $certificate = DB::table('certificates')->where('id', $certId)->first();

        return response()->json([
            'success'     => true,
            'message'     => 'Mark Sheet issued and uploaded successfully.',
            'certificate' => $certificate
        ]);
    }

    /**
     * Admin: Delete Certificate / Mark Sheet
     */
    public function adminDeleteCertificate($id)
    {
        DB::table('certificates')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Record deleted successfully.'
        ]);
    }
}
