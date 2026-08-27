<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Carbon\Carbon;

class BatchController extends Controller
{
    /**
     * Ensure default quarterly batches exist for the current year and auto-update their status based on current date.
     */
    public static function ensureDefaultBatches($year = null)
    {
        $year = $year ?: date('Y');
        $today = now()->format('Y-m-d');

        $defaultBatches = [
            [
                'name'         => "{$year} - Batch 1 (Jan - Mar)",
                'batch_code'   => "{$year}-B1",
                'course_level' => 'all',
                'start_date'   => "{$year}-01-01",
                'end_date'     => "{$year}-03-31",
                'description'  => "First Quarter Batch ({$year})"
            ],
            [
                'name'         => "{$year} - Batch 2 (Apr - Jun)",
                'batch_code'   => "{$year}-B2",
                'course_level' => 'all',
                'start_date'   => "{$year}-04-01",
                'end_date'     => "{$year}-06-30",
                'description'  => "Second Quarter Batch ({$year})"
            ],
            [
                'name'         => "{$year} - Batch 3 (Jul - Sep)",
                'batch_code'   => "{$year}-B3",
                'course_level' => 'all',
                'start_date'   => "{$year}-07-01",
                'end_date'     => "{$year}-09-30",
                'description'  => "Third Quarter Batch ({$year})"
            ],
            [
                'name'         => "{$year} - Batch 4 (Oct - Dec)",
                'batch_code'   => "{$year}-B4",
                'course_level' => 'all',
                'start_date'   => "{$year}-10-01",
                'end_date'     => "{$year}-12-31",
                'description'  => "Fourth Quarter Batch ({$year})"
            ],
        ];

        foreach ($defaultBatches as $b) {
            $startDate = $b['start_date'];
            $endDate   = $b['end_date'];

            // Determine status dynamically based on current date
            if ($today >= $startDate && $today <= $endDate) {
                $computedStatus = 'active';
            } elseif ($today < $startDate) {
                $computedStatus = 'upcoming';
            } else {
                $computedStatus = 'completed';
            }

            $existing = DB::table('batches')->where('batch_code', $b['batch_code'])->first();
            if (!$existing) {
                DB::table('batches')->insert(array_merge($b, [
                    'status'     => $computedStatus,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            } else {
                // Keep default quarterly batch status synchronized with calendar date
                if (in_array($existing->status, ['active', 'upcoming', 'completed'])) {
                    DB::table('batches')->where('id', $existing->id)->update([
                        'status'     => $computedStatus,
                        'updated_at' => now()
                    ]);
                }
            }
        }
    }

    /**
     * Determine auto batch for a given registration date
     */
    public static function getAutoBatchForDate($date = null, $courseLevel = 'all')
    {
        $dt = $date ? Carbon::parse($date) : now();
        $year = $dt->year;
        $month = $dt->month;

        self::ensureDefaultBatches($year);

        if ($month <= 3) {
            $code = "{$year}-B1";
        } elseif ($month <= 6) {
            $code = "{$year}-B2";
        } elseif ($month <= 9) {
            $code = "{$year}-B3";
        } else {
            $code = "{$year}-B4";
        }

        $batch = DB::table('batches')->where('batch_code', $code)->first();
        return $batch;
    }

    /**
     * Public API: Get Active / Upcoming Batches for enrollment (Active first, then Upcoming)
     */
    public function getPublicBatches()
    {
        self::ensureDefaultBatches();

        $batches = DB::table('batches')
            ->whereIn('status', ['active', 'upcoming'])
            ->orderByRaw("CASE WHEN status = 'active' THEN 1 WHEN status = 'upcoming' THEN 2 ELSE 3 END")
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'batches' => $batches
        ]);
    }

    /**
     * Admin: Get all Batches with student count (Sorted: Active first, then Upcoming, then Completed)
     */
    public function adminGetBatches()
    {
        self::ensureDefaultBatches();

        $batches = DB::table('batches')
            ->orderByRaw("CASE WHEN status = 'active' THEN 1 WHEN status = 'upcoming' THEN 2 WHEN status = 'completed' THEN 3 ELSE 4 END")
            ->orderBy('start_date', 'asc')
            ->get()
            ->map(function ($b) {
                // Count students linked via batch_id OR auto-assigned quarter fallback
                $directCount = DB::table('users')
                    ->where('role', 'user')
                    ->where('batch_id', $b->id)
                    ->count();

                $b->students_count = $directCount;
                return $b;
            });

        // Compute total students
        $totalStudents = DB::table('users')->where('role', 'user')->count();

        return response()->json([
            'success'        => true,
            'batches'        => $batches,
            'total_students' => $totalStudents
        ]);
    }

    /**
     * Admin: Create new custom batch
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'batch_code'   => 'nullable|string|max:50',
            'course_level' => 'required|string', // ilanilai, mudhunilai, all
            'start_date'   => 'nullable|date',
            'end_date'     => 'nullable|date',
            'status'       => 'required|string|in:upcoming,active,completed,closed',
            'description'  => 'nullable|string',
        ]);

        $batchCode = $validated['batch_code'] ?? null;
        if (!$batchCode) {
            $batchCode = 'BAT-' . strtoupper(uniqid());
        }

        $id = DB::table('batches')->insertGetId([
            'name'         => $validated['name'],
            'batch_code'   => $batchCode,
            'course_level' => $validated['course_level'],
            'start_date'   => $validated['start_date'] ?? null,
            'end_date'     => $validated['end_date'] ?? null,
            'status'       => $validated['status'],
            'description'  => $validated['description'] ?? null,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        $batch = DB::table('batches')->where('id', $id)->first();

        return response()->json([
            'success' => true,
            'message' => 'புதிய பேட்ச் வெற்றிகரமாக உருவாக்கப்பட்டது (Batch created successfully).',
            'batch'   => $batch
        ], 201);
    }

    /**
     * Admin: Update batch details
     */
    public function update(Request $request, $id)
    {
        $batch = DB::table('batches')->where('id', $id)->first();
        if (!$batch) {
            return response()->json(['success' => false, 'message' => 'Batch not found.'], 404);
        }

        $validated = $request->validate([
            'name'         => 'sometimes|string|max:255',
            'course_level' => 'sometimes|string',
            'start_date'   => 'sometimes|nullable|date',
            'end_date'     => 'sometimes|nullable|date',
            'status'       => 'sometimes|string|in:upcoming,active,completed,closed',
            'description'  => 'sometimes|nullable|string',
        ]);

        $validated['updated_at'] = now();

        DB::table('batches')->where('id', $id)->update($validated);

        $updatedBatch = DB::table('batches')->where('id', $id)->first();

        return response()->json([
            'success' => true,
            'message' => 'பேட்ச் விவரங்கள் புதுப்பிக்கப்பட்டது (Batch updated successfully).',
            'batch'   => $updatedBatch
        ]);
    }

    /**
     * Admin: Delete batch safely
     */
    public function destroy($id)
    {
        $batch = DB::table('batches')->where('id', $id)->first();
        if (!$batch) {
            return response()->json(['success' => false, 'message' => 'Batch not found.'], 404);
        }

        $studentsCount = DB::table('users')->where('batch_id', $id)->count();
        if ($studentsCount > 0) {
            // Unassign batch from students before deleting
            DB::table('users')->where('batch_id', $id)->update(['batch_id' => null]);
        }

        DB::table('batches')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'பேட்ச் நீக்கப்பட்டது (Batch deleted successfully).'
        ]);
    }

    /**
     * Admin: Shift / Assign a student to a specific Batch
     */
    public function shiftStudentBatch(Request $request, $userId)
    {
        $request->validate([
            'batch_id' => 'nullable|exists:batches,id',
        ]);

        $user = User::where('id', $userId)->where('role', '!=', 'admin')->first();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'மாணவர் கணக்கு கிடைக்கவில்லை.'], 404);
        }

        $batchId = $request->input('batch_id');
        $batch = $batchId ? DB::table('batches')->where('id', $batchId)->first() : null;

        $jathagam = $user->jathagam_details
            ? (is_string($user->jathagam_details) ? json_decode($user->jathagam_details, true) : (array)$user->jathagam_details)
            : [];

        if ($batch) {
            $jathagam['batch_id']   = $batch->id;
            $jathagam['batch_name'] = $batch->name;
            $jathagam['batch_code'] = $batch->batch_code;
        } else {
            unset($jathagam['batch_id'], $jathagam['batch_name'], $jathagam['batch_code']);
        }

        $user->batch_id = $batchId;
        $user->jathagam_details = json_encode($jathagam);
        $user->save();

        return response()->json([
            'success'    => true,
            'message'    => 'மாணவர் பேட்ச் வெற்றிகரமாக மாற்றப்பட்டது (Student batch shifted successfully).',
            'batch_name' => $batch ? $batch->name : 'Unassigned',
            'user'       => $user
        ]);
    }
}
