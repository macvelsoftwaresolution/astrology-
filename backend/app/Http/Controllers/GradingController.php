<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GradingController extends Controller
{
    /**
     * Get all student exam submissions (PDF uploads & physical courier answer papers)
     */
    public function getSubmissions()
    {
        $submissions = DB::table('student_submissions')
            ->join('users', 'student_submissions.student_id', '=', 'users.id')
            ->join('courses', 'student_submissions.course_id', '=', 'courses.id')
            ->select(
                'student_submissions.*',
                'users.name as student_name',
                'users.email as student_email',
                'courses.title as course_title'
            )
            ->orderBy('student_submissions.created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'submissions' => $submissions
        ]);
    }

    /**
     * Grade Student Exam Submission & Auto-issue E-Certificate on Pass
     */
    public function evaluateSubmission(Request $request, $id)
    {
        $request->validate([
            'score' => 'required|integer|min:0|max:100',
            'status' => 'required|in:Approved,Rejected',
            'evaluator_notes' => 'nullable|string',
        ]);

        $submission = DB::table('student_submissions')->where('id', $id)->first();

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission record not found.'
            ], 404);
        }

        DB::table('student_submissions')->where('id', $id)->update([
            'score' => $request->score,
            'status' => $request->status,
            'evaluator_notes' => $request->evaluator_notes,
            'updated_at' => now()
        ]);

        $certificate = null;

        // If approved & score >= 60, issue E-Certificate
        if ($request->status === 'Approved' && $request->score >= 60) {
            $certNum = 'ASTRO-CERT-' . date('Y') . '-' . Str::random(5);
            $verifyCode = 'VERIFY-' . strtoupper(Str::random(8));

            $certId = DB::table('certificates')->insertGetId([
                'certificate_number' => strtoupper($certNum),
                'student_id' => $submission->student_id,
                'course_id' => $submission->course_id,
                'score' => $request->score,
                'issue_date' => now()->toDateString(),
                'verification_code' => $verifyCode,
                'pdf_download_url' => "/api/certificates/{$certNum}/download",
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $certificate = DB::table('certificates')->where('id', $certId)->first();
        }

        return response()->json([
            'success' => true,
            'message' => $request->status === 'Approved' ? 'Submission approved & graded successfully.' : 'Submission rejected.',
            'certificate_issued' => $certificate !== null,
            'certificate' => $certificate
        ]);
    }

    /**
     * User/Student: Submit Exam Answers (PDF or Courier Tracking)
     */
    public function submitExam(Request $request)
    {
        $request->validate([
            'course_id' => 'required',
            'submission_type' => 'required|in:pdf_upload,physical_courier,online_quiz',
            'pdf_url' => 'nullable|string',
            'courier_tracking_no' => 'nullable|string',
            'courier_name' => 'nullable|string',
            'score' => 'nullable|integer',
        ]);

        $user = $request->user();
        $studentId = $user ? $user->id : 1;

        $submissionId = DB::table('student_submissions')->insertGetId([
            'student_id' => $studentId,
            'course_id' => $request->course_id,
            'submission_type' => $request->submission_type,
            'pdf_url' => $request->pdf_url,
            'courier_tracking_no' => $request->courier_tracking_no,
            'courier_name' => $request->courier_name,
            'score' => $request->score,
            'status' => $request->submission_type === 'online_quiz' && $request->score >= 60 ? 'Approved' : 'Pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'தேர்வு விடைத்தாள் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.',
            'submission_id' => $submissionId
        ]);
    }

    /**
     * User/Student: Get My Certificates & Submissions
     */
    public function getMyCertificates(Request $request)
    {
        $user = $request->user();
        $studentId = $user ? $user->id : 1;

        $certificates = DB::table('certificates')
            ->where('student_id', $studentId)
            ->join('courses', 'certificates.course_id', '=', 'courses.id')
            ->select('certificates.*', 'courses.title as course_title')
            ->orderBy('certificates.created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'certificates' => $certificates
        ]);
    }
}
