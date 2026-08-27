<?php

namespace App\Http\Controllers;

use App\Models\CourseBatch;
use App\Models\DailyCurriculum;
use App\Models\StudentDailyProgress;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LmsCurriculumController extends Controller
{
    /**
     * Get all batches for Admin (auto-seeds 4 default quarterly batches per year if none exist)
     */
    public function getAdminBatches(Request $request)
    {
        $year = (int) $request->input('year', date('Y'));
        $level = $request->input('level', 'ilanilai');

        $batches = CourseBatch::where('year', $year)
            ->where('course_level', $level)
            ->orderBy('id', 'asc')
            ->get();

        if ($batches->isEmpty()) {
            $defaultBatches = [
                [
                    'batch_code'   => "{$year}-A-{$level}",
                    'name'         => "Batch A (Feb - Apr {$year})",
                    'course_level' => $level,
                    'year'         => $year,
                    'quarter'      => 'Q1',
                    'start_date'   => "{$year}-02-01",
                    'end_date'     => "{$year}-04-30",
                    'status'       => 'active',
                ],
                [
                    'batch_code'   => "{$year}-B-{$level}",
                    'name'         => "Batch B (May - Jul {$year})",
                    'course_level' => $level,
                    'year'         => $year,
                    'quarter'      => 'Q2',
                    'start_date'   => "{$year}-05-01",
                    'end_date'     => "{$year}-07-31",
                    'status'       => 'upcoming',
                ],
                [
                    'batch_code'   => "{$year}-C-{$level}",
                    'name'         => "Batch C (Aug - Oct {$year})",
                    'course_level' => $level,
                    'year'         => $year,
                    'quarter'      => 'Q3',
                    'start_date'   => "{$year}-08-01",
                    'end_date'     => "{$year}-10-31",
                    'status'       => 'upcoming',
                ],
                [
                    'batch_code'   => "{$year}-D-{$level}",
                    'name'         => "Batch D (Nov - Jan " . ($year + 1) . ")",
                    'course_level' => $level,
                    'year'         => $year,
                    'quarter'      => 'Q4',
                    'start_date'   => "{$year}-11-01",
                    'end_date'     => ($year + 1) . "-01-31",
                    'status'       => 'upcoming',
                ],
            ];

            foreach ($defaultBatches as $b) {
                CourseBatch::create($b);
            }

            $batches = CourseBatch::where('year', $year)
                ->where('course_level', $level)
                ->orderBy('id', 'asc')
                ->get();
        }

        return response()->json([
            'success' => true,
            'batches' => $batches,
        ]);
    }

    /**
     * Create or Update a Batch (Admin)
     */
    public function createOrUpdateBatch(Request $request)
    {
        $request->validate([
            'name'         => 'required|string',
            'batch_code'   => 'required|string',
            'course_level' => 'required|string',
            'year'         => 'required|integer',
            'quarter'      => 'required|string',
        ]);

        $batch = CourseBatch::updateOrCreate(
            ['id' => $request->input('id')],
            [
                'batch_code'   => $request->input('batch_code'),
                'name'         => $request->input('name'),
                'course_level' => $request->input('course_level', 'ilanilai'),
                'year'         => $request->input('year', date('Y')),
                'quarter'      => $request->input('quarter', 'Q1'),
                'start_date'   => $request->input('start_date'),
                'end_date'     => $request->input('end_date'),
                'status'       => $request->input('status', 'active'),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Batch details saved successfully.',
            'batch'   => $batch,
        ]);
    }

    /**
     * Fetch 60 Days Curriculum for a Batch (Admin & Public)
     */
    public function getBatchCurriculum(Request $request, $batchId)
    {
        $batch = CourseBatch::find($batchId);
        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found.',
            ], 404);
        }

        $curriculum = DailyCurriculum::where('batch_id', $batchId)
            ->orderBy('day_number', 'asc')
            ->get();

        return response()->json([
            'success'    => true,
            'batch'      => $batch,
            'curriculum' => $curriculum,
            'total_days' => $curriculum->count(),
        ]);
    }

    /**
     * Save/Update a Day's Curriculum (Admin CRUD)
     */
    public function saveDayCurriculum(Request $request)
    {
        $request->validate([
            'batch_id'   => 'required|exists:course_batches,id',
            'day_number' => 'required|integer|min:1|max:60',
            'title'      => 'required|string',
        ]);

        $batchId   = $request->input('batch_id');
        $dayNumber = (int) $request->input('day_number');

        $curriculum = DailyCurriculum::updateOrCreate(
            [
                'batch_id'   => $batchId,
                'day_number' => $dayNumber,
            ],
            [
                'title'            => $request->input('title'),
                'description'      => $request->input('description', ''),
                'audio_url'        => $request->input('audio_url', null),
                'audios_json'      => $request->input('audios_json', []),
                'images_json'      => $request->input('images_json', []),
                'pdf_material_url' => $request->input('pdf_material_url', null),
                'pdfs_json'        => $request->input('pdfs_json', []),
                'is_published'     => $request->input('is_published', true),
            ]
        );

        return response()->json([
            'success'    => true,
            'message'    => "Day {$dayNumber} curriculum saved successfully.",
            'curriculum' => $curriculum,
        ]);
    }

    /**
     * 1-Click Copy 60 Days Curriculum from one Batch to another Batch (Admin)
     */
    public function copyBatchCurriculum(Request $request)
    {
        $request->validate([
            'from_batch_id' => 'required|exists:course_batches,id',
            'to_batch_id'   => 'required|exists:course_batches,id',
        ]);

        $fromBatchId = $request->input('from_batch_id');
        $toBatchId   = $request->input('to_batch_id');

        if ($fromBatchId == $toBatchId) {
            return response()->json([
                'success' => false,
                'message' => 'Source and target batches cannot be the same.',
            ], 422);
        }

        $sourceLessons = DailyCurriculum::where('batch_id', $fromBatchId)->get();

        if ($sourceLessons->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No curriculum lessons found in the source batch to copy.',
            ], 404);
        }

        $copiedCount = 0;
        foreach ($sourceLessons as $lesson) {
            DailyCurriculum::updateOrCreate(
                [
                    'batch_id'   => $toBatchId,
                    'day_number' => $lesson->day_number,
                ],
                [
                    'title'            => $lesson->title,
                    'description'      => $lesson->description,
                    'audio_url'        => $lesson->audio_url,
                    'audios_json'      => $lesson->audios_json,
                    'images_json'      => $lesson->images_json,
                    'pdf_material_url' => $lesson->pdf_material_url,
                    'pdfs_json'        => $lesson->pdfs_json,
                    'is_published'     => $lesson->is_published,
                ]
            );
            $copiedCount++;
        }

        return response()->json([
            'success'      => true,
            'message'      => "Successfully copied {$copiedCount} daily lessons to the target batch.",
            'copied_count' => $copiedCount,
        ]);
    }

    /**
     * Delete a Day Curriculum Lesson (Admin)
     */
    public function deleteDayCurriculum(Request $request, $id)
    {
        $curriculum = DailyCurriculum::find($id);
        if (!$curriculum) {
            return response()->json([
                'success' => false,
                'message' => 'Curriculum lesson not found.',
            ], 404);
        }

        $curriculum->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lesson deleted successfully.',
        ]);
    }

    /**
     * Student LMS Dashboard: Fetch 60-Day Learning Path with Progress
     */
    public function getStudentCurriculum(Request $request)
    {
        $user = $request->user();

        // If authenticated as student or user
        $student = null;
        if ($user) {
            $student = Student::where('email', $user->email)
                ->orWhere('student_id', $user->student_id ?? '')
                ->first();
        }

        // Get student details from jathagam_details or fallback
        $jathagam = ($student && $student->jathagam_details)
            ? (is_string($student->jathagam_details) ? json_decode($student->jathagam_details, true) : (array)$student->jathagam_details)
            : [];

        $courseLevel = $jathagam['courseLevel'] ?? 'ilanilai';

        // Get active batch for this course level
        $activeBatch = CourseBatch::where('course_level', $courseLevel)
            ->where('status', 'active')
            ->orderBy('id', 'asc')
            ->first();

        if (!$activeBatch) {
            // Fallback to first available batch
            $activeBatch = CourseBatch::where('course_level', $courseLevel)->first();
        }

        if (!$activeBatch) {
            // Auto seed if completely empty
            $this->getAdminBatches(new Request(['year' => date('Y'), 'level' => $courseLevel]));
            $activeBatch = CourseBatch::where('course_level', $courseLevel)->first();
        }

        $curriculum = DailyCurriculum::where('batch_id', $activeBatch->id)
            ->where('is_published', true)
            ->orderBy('day_number', 'asc')
            ->get();

        // Get student completed day IDs
        $completedDayIds = [];
        if ($student) {
            $completedDayIds = StudentDailyProgress::where('student_id', $student->id)
                ->where('is_completed', true)
                ->pluck('curriculum_id')
                ->toArray();
        }

        // Attach completion flag to each day
        $curriculumData = $curriculum->map(function ($item) use ($completedDayIds) {
            $arr = $item->toArray();
            $arr['is_completed'] = in_array($item->id, $completedDayIds);
            return $arr;
        });

        return response()->json([
            'success'          => true,
            'student'          => $student ? [
                'id'         => $student->id,
                'name'       => $student->name,
                'email'      => $student->email,
                'student_id' => $student->student_id,
            ] : null,
            'active_batch'     => $activeBatch,
            'curriculum'       => $curriculumData,
            'completed_count'  => count($completedDayIds),
            'total_count'      => $curriculum->count(),
        ]);
    }

    /**
     * Mark a Day Lesson as Completed by Student
     */
    public function markDayComplete(Request $request, $curriculumId)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 401);
        }

        $student = Student::where('email', $user->email)
            ->orWhere('student_id', $user->student_id ?? '')
            ->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student record not found.',
            ], 404);
        }

        $progress = StudentDailyProgress::updateOrCreate(
            [
                'student_id'    => $student->id,
                'curriculum_id' => $curriculumId,
            ],
            [
                'is_completed' => true,
                'completed_at' => now(),
            ]
        );

        return response()->json([
            'success'  => true,
            'message'  => 'Day lesson marked as completed!',
            'progress' => $progress,
        ]);
    }
}
