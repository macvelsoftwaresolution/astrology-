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
        $rawLevel = trim($request->input('level', 'ilanilai'));
        $level = strtolower($rawLevel);
        if ($level === 'mudhunilai') {
            $level = 'muthunilai';
        }
        $today = now()->format('Y-m-d');

        $defaultBatches = [
            [
                'batch_code'   => "{$year}-B1-{$level}",
                'name'         => "Batch 1 (Jan - Mar {$year})",
                'course_level' => $level,
                'year'         => $year,
                'quarter'      => 'Q1',
                'start_date'   => "{$year}-01-01",
                'end_date'     => "{$year}-03-31",
            ],
            [
                'batch_code'   => "{$year}-B2-{$level}",
                'name'         => "Batch 2 (Apr - Jun {$year})",
                'course_level' => $level,
                'year'         => $year,
                'quarter'      => 'Q2',
                'start_date'   => "{$year}-04-01",
                'end_date'     => "{$year}-06-30",
            ],
            [
                'batch_code'   => "{$year}-B3-{$level}",
                'name'         => "Batch 3 (Jul - Sep {$year})",
                'course_level' => $level,
                'year'         => $year,
                'quarter'      => 'Q3',
                'start_date'   => "{$year}-07-01",
                'end_date'     => "{$year}-09-30",
            ],
            [
                'batch_code'   => "{$year}-B4-{$level}",
                'name'         => "Batch 4 (Oct - Dec {$year})",
                'course_level' => $level,
                'year'         => $year,
                'quarter'      => 'Q4',
                'start_date'   => "{$year}-10-01",
                'end_date'     => "{$year}-12-31",
            ],
        ];

        foreach ($defaultBatches as $b) {
            $startDate = $b['start_date'];
            $endDate   = $b['end_date'];
            if ($today >= $startDate && $today <= $endDate) {
                $computedStatus = 'active';
            } elseif ($today < $startDate) {
                $computedStatus = 'upcoming';
            } else {
                $computedStatus = 'completed';
            }

            $existing = CourseBatch::where('year', $year)
                ->where(function ($q) use ($level, $rawLevel) {
                    $q->whereRaw('LOWER(course_level) = ?', [$level])
                      ->orWhere('course_level', $level)
                      ->orWhere('course_level', $rawLevel)
                      ->orWhere('course_level', strtoupper($level));
                })
                ->where('quarter', $b['quarter'])
                ->first();

            if (!$existing) {
                CourseBatch::create(array_merge($b, ['status' => $computedStatus]));
            } else {
                $existing->update([
                    'name'         => $b['name'],
                    'batch_code'   => $b['batch_code'],
                    'course_level' => $level,
                    'start_date'   => $b['start_date'],
                    'end_date'     => $b['end_date'],
                    'status'       => $computedStatus,
                ]);
            }
        }

        $batches = CourseBatch::where('year', $year)
            ->where(function ($q) use ($level, $rawLevel) {
                $q->whereRaw('LOWER(course_level) = ?', [$level])
                  ->orWhere('course_level', $level)
                  ->orWhere('course_level', $rawLevel)
                  ->orWhere('course_level', strtoupper($level));
            })
            ->orderByRaw("CASE WHEN status = 'active' THEN 1 WHEN status = 'upcoming' THEN 2 WHEN status = 'completed' THEN 3 ELSE 4 END")
            ->orderBy('start_date', 'asc')
            ->get();

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
                'audio_url'        => $request->input('audio_url') ? $request->input('audio_url') : null,
                'audios_json'      => $request->input('audios_json', []),
                'images_json'      => $request->input('images_json', []),
                'pdf_material_url' => $request->input('pdf_material_url') ? $request->input('pdf_material_url') : null,
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
        try {
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

            $rawLevel = trim($jathagam['courseLevel'] ?? 'ilanilai');
            $courseLevel = strtolower($rawLevel);
            if ($courseLevel === 'mudhunilai') {
                $courseLevel = 'muthunilai';
            }

            // Determine student's registration date safely
            $rawDate = $student?->created_at ?? $user?->created_at ?? null;
            $regDate = $rawDate ? \Illuminate\Support\Carbon::parse($rawDate) : now();
            $year    = (int) $regDate->format('Y');
            $month   = (int) $regDate->format('m');

            // Determine Quarter based on registration month:
            // Jan-Mar => Q1, Apr-Jun => Q2, Jul-Sep => Q3, Oct-Dec => Q4
            if ($month >= 1 && $month <= 3) {
                $quarter = 'Q1';
            } elseif ($month >= 4 && $month <= 6) {
                $quarter = 'Q2';
            } elseif ($month >= 7 && $month <= 9) {
                $quarter = 'Q3';
            } else {
                $quarter = 'Q4';
            }

            // 1. Strict Batch Resolution for Student (Case-Insensitive)
            $studentBatch = null;

            // If student already has explicit batch_id in DB, check if valid in course_batches
            if ($student && $student->batch_id) {
                $studentBatch = CourseBatch::find($student->batch_id);
            }
            if (!$studentBatch && $user && $user->batch_id) {
                $studentBatch = CourseBatch::find($user->batch_id);
            }

            // If no explicit batch assigned, find matching quarter batch by registration date & level
            if (!$studentBatch) {
                $studentBatch = CourseBatch::where('year', $year)
                    ->where(function ($q) use ($courseLevel, $rawLevel) {
                        $q->whereRaw('LOWER(course_level) = ?', [$courseLevel])
                          ->orWhere('course_level', $courseLevel)
                          ->orWhere('course_level', $rawLevel)
                          ->orWhere('course_level', strtoupper($courseLevel));
                    })
                    ->where('quarter', $quarter)
                    ->first();
            }

            // If batch doesn't exist in DB yet, auto-seed and find it
            if (!$studentBatch) {
                try {
                    $this->getAdminBatches(new Request(['year' => $year, 'level' => $courseLevel]));
                } catch (\Throwable $e) {}
                
                $studentBatch = CourseBatch::where('year', $year)
                    ->where(function ($q) use ($courseLevel, $rawLevel) {
                        $q->whereRaw('LOWER(course_level) = ?', [$courseLevel])
                          ->orWhere('course_level', $courseLevel)
                          ->orWhere('course_level', $rawLevel)
                          ->orWhere('course_level', strtoupper($courseLevel));
                    })
                    ->where('quarter', $quarter)
                    ->first();
            }

            // If still no batch, fallback to first available batch for this course level
            if (!$studentBatch) {
                $studentBatch = CourseBatch::where(function ($q) use ($courseLevel, $rawLevel) {
                    $q->whereRaw('LOWER(course_level) = ?', [$courseLevel])
                      ->orWhere('course_level', $courseLevel)
                      ->orWhere('course_level', $rawLevel)
                      ->orWhere('course_level', strtoupper($courseLevel));
                })->first();
            }

            // Auto-assign batch_id to student record safely
            if ($studentBatch && $student && !$student->batch_id) {
                try {
                    $student->batch_id = $studentBatch->id;
                    $student->save();
                } catch (\Throwable $e) {}
            }

            // 2. Fetch published lessons created for this student's batch
            $curriculum = $studentBatch
                ? DailyCurriculum::where('batch_id', $studentBatch->id)
                    ->where('is_published', true)
                    ->orderBy('day_number', 'asc')
                    ->get()
                : collect([]);

            // Get student completed day IDs
            $completedDayIds = [];
            if ($student) {
                try {
                    $completedDayIds = StudentDailyProgress::where('student_id', $student->id)
                        ->where('is_completed', true)
                        ->pluck('curriculum_id')
                        ->toArray();
                } catch (\Throwable $e) {}
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
                    'batch_id'   => $studentBatch?->id,
                ] : null,
                'active_batch'     => $studentBatch,
                'curriculum'       => $curriculumData,
                'completed_count'  => count($completedDayIds),
                'total_count'      => $curriculum->count(),
            ]);

        } catch (\Throwable $ex) {
            Log::error('getStudentCurriculum Error: ' . $ex->getMessage());
            return response()->json([
                'success'         => false,
                'message'         => 'Error fetching curriculum: ' . $ex->getMessage(),
                'active_batch'    => null,
                'curriculum'      => [],
                'completed_count' => 0,
                'total_count'     => 0,
            ], 200);
        }
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
