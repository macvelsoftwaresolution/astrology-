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
            ->leftJoin('courses', 'student_submissions.course_id', '=', 'courses.id')
            ->select(
                'student_submissions.*',
                'users.name as student_name',
                'users.email as student_email',
                DB::raw("COALESCE(courses.title, 'வேத ஜோதிடம் (Vedic Astrology)') as course_title")
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
            $certNum = 'ASTRO-CERT-' . date('Y') . '-' . strtoupper(Str::random(5));
            $verifyCode = 'VERIFY-' . strtoupper(Str::random(8));

            $certId = DB::table('certificates')->insertGetId([
                'certificate_number' => strtoupper($certNum),
                'student_id'         => $submission->student_id,
                'course_id'          => $submission->course_id ?: 1,
                'score'              => $request->score,
                'grade'              => $request->score >= 80 ? 'Distinction' : 'First Class',
                'issue_date'         => now()->toDateString(),
                'verification_code'  => $verifyCode,
                'pdf_download_url'   => "/api/certificates/{$certNum}/download",
                'created_at'         => now(),
                'updated_at'         => now(),
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
            'course_id' => 'nullable',
            'submission_type' => 'required|in:pdf_upload,physical_courier,online_quiz',
            'pdf_url' => 'nullable|string',
            'courier_tracking_no' => 'nullable|string',
            'courier_name' => 'nullable|string',
            'score' => 'nullable|integer',
        ]);

        $user = $request->user();
        $studentId = $user ? $user->id : 1;
        $courseId = $request->course_id ?: (DB::table('courses')->value('id') ?: 1);

        $submissionId = DB::table('student_submissions')->insertGetId([
            'student_id' => $studentId,
            'course_id' => $courseId,
            'submission_type' => $request->submission_type,
            'pdf_url' => $request->pdf_url,
            'courier_tracking_no' => $request->courier_tracking_no,
            'courier_name' => $request->courier_name,
            'score' => $request->score,
            'status' => $request->submission_type === 'online_quiz' && $request->score >= 60 ? 'Approved' : 'Pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Notification for student
        try {
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
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => 'தேர்வு விடைத்தாள் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.',
            'submission_id' => $submissionId
        ]);
    }

    /**
     * User/Student: Get My Certificates & Marksheets
     */
    public function getMyCertificates(Request $request)
    {
        $user = $request->user();
        $studentId = $user ? $user->id : 1;

        $certificates = DB::table('certificates')
            ->where('student_id', $studentId)
            ->leftJoin('courses', 'certificates.course_id', '=', 'courses.id')
            ->select(
                'certificates.*',
                DB::raw("COALESCE(courses.title, 'இளநிலை ஜோதிட மணி (Vedic Astrology)') as course_title")
            )
            ->orderBy('certificates.created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'certificates' => $certificates
        ]);
    }

    /**
     * Admin: Get all issued/uploaded certificates & marksheets
     */
    public function adminGetCertificates()
    {
        $certificates = DB::table('certificates')
            ->join('users', 'certificates.student_id', '=', 'users.id')
            ->leftJoin('courses', 'certificates.course_id', '=', 'courses.id')
            ->select(
                'certificates.*',
                'users.name as student_name',
                'users.email as student_email',
                'users.phone as student_phone',
                'users.student_id as student_reg_id',
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
            'pdf_download_url' => 'required|string',
            'course_id' => 'nullable',
            'score' => 'nullable|integer',
            'grade' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'certificate_number' => 'nullable|string',
        ]);

        $courseId = $request->course_id ?: (DB::table('courses')->value('id') ?: 1);
        $certNum = $request->certificate_number ?: ('ASTRO-CERT-' . date('Y') . '-' . strtoupper(Str::random(6)));
        $verifyCode = 'VERIFY-' . strtoupper(Str::random(8));

        // Check if student already has certificate record for this course
        $existing = DB::table('certificates')
            ->where('student_id', $request->student_id)
            ->where('course_id', $courseId)
            ->first();

        if ($existing) {
            DB::table('certificates')->where('id', $existing->id)->update([
                'certificate_number' => strtoupper($certNum),
                'pdf_download_url'   => $request->pdf_download_url,
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
                'pdf_download_url'   => $request->pdf_download_url,
                'created_at'         => now(),
                'updated_at'         => now(),
            ]);
        }

        $certificate = DB::table('certificates')->where('id', $certId)->first();

        return response()->json([
            'success'     => true,
            'message'     => 'Certificate issued and uploaded successfully.',
            'certificate' => $certificate
        ]);
    }

    /**
     * Admin: Issue / Upload Mark Sheet for Student
     */
    public function adminUploadMarksheet(Request $request)
    {
        $request->validate([
            'student_id'             => 'required|exists:users,id',
            'marksheet_download_url' => 'required|string',
            'course_id'              => 'nullable',
            'score'                  => 'required|integer|min:0|max:100',
            'grade'                  => 'nullable|string',
            'issue_date'             => 'nullable|date',
            'marksheet_number'       => 'nullable|string',
        ]);

        $courseId = $request->course_id ?: (DB::table('courses')->value('id') ?: 1);
        $mrkNum = $request->marksheet_number ?: ('ASTRO-MRK-' . date('Y') . '-' . strtoupper(Str::random(6)));
        $verifyCode = 'VERIFY-' . strtoupper(Str::random(8));

        // Check if student already has record for this course
        $existing = DB::table('certificates')
            ->where('student_id', $request->student_id)
            ->where('course_id', $courseId)
            ->first();

        if ($existing) {
            DB::table('certificates')->where('id', $existing->id)->update([
                'marksheet_number'       => strtoupper($mrkNum),
                'marksheet_download_url' => $request->marksheet_download_url,
                'score'                  => $request->score,
                'grade'                  => $request->grade ?: ($existing->grade ?? 'First Class'),
                'issue_date'             => $request->issue_date ?: $existing->issue_date,
                'updated_at'             => now(),
            ]);
            $certId = $existing->id;
        } else {
            $dummyCertNum = 'ASTRO-CERT-' . date('Y') . '-' . strtoupper(Str::random(6));
            $certId = DB::table('certificates')->insertGetId([
                'certificate_number'     => strtoupper($dummyCertNum),
                'marksheet_number'       => strtoupper($mrkNum),
                'student_id'             => $request->student_id,
                'course_id'              => $courseId,
                'score'                  => $request->score,
                'grade'                  => $request->grade ?: 'First Class',
                'issue_date'             => $request->issue_date ?: now()->toDateString(),
                'verification_code'      => $verifyCode,
                'marksheet_download_url' => $request->marksheet_download_url,
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
