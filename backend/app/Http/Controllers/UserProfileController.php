<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserProfileController extends Controller
{
    /**
     * Get logged-in user's full profile
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id'               => $user->id,
            'name'             => $user->name,
            'email'            => $user->email,
            'phone'            => $user->phone,
            'address'          => $user->address ?? null,
            'avatar_url'       => $user->avatar_url ?? null,
            'jathagam_details' => $user->jathagam_details
                ? (is_string($user->jathagam_details) ? json_decode($user->jathagam_details) : $user->jathagam_details)
                : null,
            'role'             => $user->role,
            'status'           => $user->status,
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'             => 'sometimes|string|max:255',
            'email'            => 'sometimes|email|max:255',
            'phone'            => 'sometimes|string|max:20',
            'address'          => 'sometimes|nullable|string',
            'avatar_url'       => 'sometimes|nullable|string',
            'jathagam_details' => 'sometimes|nullable',
        ]);

        if (isset($validated['jathagam_details']) && is_array($validated['jathagam_details'])) {
            $validated['jathagam_details'] = json_encode($validated['jathagam_details']);
        }

        $user->fill($validated);

        if ($request->filled('new_password')) {
            $request->validate([
                'new_password' => 'min:6'
            ]);
            $user->password = Hash::make($request->input('new_password'));
        }

        if ($user->isDirty()) {
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'சுயவிவரம் புதுப்பிக்கப்பட்டது.',
            'user'    => [
                'id'               => $user->id,
                'name'             => $user->name,
                'email'            => $user->email,
                'phone'            => $user->phone,
                'address'          => $user->address,
                'avatar_url'       => $user->avatar_url,
                'jathagam_details' => $user->jathagam_details
                    ? (is_string($user->jathagam_details) ? json_decode($user->jathagam_details) : $user->jathagam_details)
                    : null,
                'role'             => $user->role,
                'status'           => $user->status,
            ]
        ]);
    }

    /**
     * Get all bookings made by logged-in user (appointment history)
     */
    public function getMyBookings(Request $request)
    {
        $user = $request->user();

        $bookings = DB::table('bookings')
            ->where(function($q) use ($user) {
                $q->where('user_id', $user->id);
                if ($user->phone) {
                    $q->orWhere('user_phone', $user->phone);
                }
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($b) {
                $b->details = is_string($b->details) ? json_decode($b->details) : $b->details;
                return $b;
            });

        return response()->json(['bookings' => $bookings]);
    }

    /**
     * Get payment transaction history for logged-in user
     */
    public function getPaymentHistory(Request $request)
    {
        $user = $request->user();

        $payments = DB::table('payment_transactions')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Also fetch any paid bookings
        $paidBookings = DB::table('bookings')
            ->where(function($q) use ($user) {
                $q->where('user_id', $user->id);
                if ($user->phone) {
                    $q->orWhere('user_phone', $user->phone);
                }
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($b) {
                $b->details = is_string($b->details) ? json_decode($b->details) : $b->details;
                return $b;
            });

        return response()->json([
            'payments' => $payments,
            'bookings' => $paidBookings
        ]);
    }

    /**
     * Admin: Get all users list with profile details (Excluding Admin accounts)
     */
    public function adminGetUsers(Request $request)
    {
        $batchIdFilter = $request->query('batch_id');

        $query = DB::table('users')
            ->leftJoin('batches', 'users.batch_id', '=', 'batches.id')
            ->where('users.role', '!=', 'admin')
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'users.phone',
                'users.role',
                'users.status',
                'users.student_id',
                'users.batch_id',
                'users.address',
                'users.jathagam_details',
                'users.created_at',
                'batches.name as batch_name',
                'batches.batch_code as batch_code',
                'batches.status as batch_status'
            );

        if ($batchIdFilter && $batchIdFilter !== 'all') {
            $query->where('users.batch_id', $batchIdFilter);
        }

        $users = $query->orderBy('users.id', 'desc')
            ->get()
            ->map(function ($u) {
                $u->jathagam_details = $u->jathagam_details ? json_decode($u->jathagam_details) : null;
                
                // Fallback batch name from registration date or jathagam_details if not directly joined
                if (empty($u->batch_name)) {
                    if (isset($u->jathagam_details->batch_name) && !empty($u->jathagam_details->batch_name)) {
                        $u->batch_name = $u->jathagam_details->batch_name;
                    } elseif (!empty($u->created_at)) {
                        $dt = \Carbon\Carbon::parse($u->created_at);
                        $year = $dt->year;
                        $m = $dt->month;
                        $q = ($m <= 3) ? 'Batch 1 (Jan - Mar)' : (($m <= 6) ? 'Batch 2 (Apr - Jun)' : (($m <= 9) ? 'Batch 3 (Jul - Sep)' : 'Batch 4 (Oct - Dec)'));
                        $u->batch_name = "{$year} - {$q}";
                    } else {
                        $u->batch_name = 'General Batch';
                    }
                }

                $bookingCount = DB::table('bookings')
                    ->where(function($q) use ($u) {
                        $q->where('user_id', $u->id);
                        if (!empty($u->phone)) {
                            $q->orWhere('user_phone', $u->phone);
                        }
                    })
                    ->count();

                $u->bookings_count = $bookingCount;
                return $u;
            });

        return response()->json(['users' => $users]);
    }

    /**
     * Admin: Get all payment transactions
     */
    public function adminGetPayments()
    {
        $payments = DB::table('payment_transactions')
            ->leftJoin('users', 'payment_transactions.user_id', '=', 'users.id')
            ->select('payment_transactions.*', 'users.name as user_name', 'users.email as user_email')
            ->orderBy('payment_transactions.created_at', 'desc')
            ->get();

        return response()->json(['payments' => $payments]);
    }

    /**
     * Admin: Delete user account (Options: mode=student_only OR mode=full)
     */
    public function deleteUser(Request $request, $id)
    {
        $mode = $request->query('mode', $request->input('mode', 'full'));

        $user = DB::table('users')->where('id', $id)->where('role', '!=', 'admin')->first();
        $student = DB::table('students')->where('id', $id)->orWhere('student_id', $id)->first();

        if (!$user && $student) {
            $user = DB::table('users')
                ->where('role', '!=', 'admin')
                ->where(function($q) use ($student) {
                    if ($student->email) $q->orWhere('email', $student->email);
                    if ($student->phone) $q->orWhere('phone', $student->phone);
                    if ($student->student_id) $q->orWhere('student_id', $student->student_id);
                })
                ->first();
        }

        if (!$user && !$student) {
            return response()->json([
                'success' => false,
                'message' => 'பயனர் கணக்கு கிடைக்கவில்லை அல்லது நிர்வாகி கணக்கை நீக்க இயலாது.'
            ], 403);
        }

        $email = $user->email ?? $student->email ?? null;
        $phone = $user->phone ?? $student->phone ?? null;
        $studentCode = $user->student_id ?? $student->student_id ?? null;
        $studentId = $student->id ?? null;

        if ($mode === 'student_only') {
            // 1. Delete record from `students` table ONLY
            DB::table('students')
                ->where(function($q) use ($studentId, $email, $phone, $studentCode) {
                    if ($studentId) $q->orWhere('id', $studentId);
                    if (!empty($email)) $q->orWhere('email', $email);
                    if (!empty($phone)) $q->orWhere('phone', $phone);
                    if (!empty($studentCode)) $q->orWhere('student_id', $studentCode);
                })
                ->delete();

            // 2. Remove student_id and batch_id in `users` table so Astrology account stays active
            if ($user) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update([
                        'student_id' => null,
                        'batch_id'   => null,
                    ]);
            }

            // 3. Wipe student access tokens
            if ($studentId) {
                DB::table('personal_access_tokens')
                    ->where('tokenable_type', 'App\\Models\\Student')
                    ->where('tokenable_id', $studentId)
                    ->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'மாணவர் கணக்கு விபரங்கள் மட்டும் நீக்கப்பட்டது. பயனர் ஜோதிட போர்ட்டலில் தொடர்ந்து பயன்படுத்தலாம்.'
            ]);
        }

        // FULL DELETE MODE (default)
        if ($user) {
            DB::table('users')->where('id', $user->id)->delete();
        }

        DB::table('students')
            ->where(function($q) use ($studentId, $email, $phone, $studentCode) {
                if ($studentId) $q->orWhere('id', $studentId);
                if (!empty($email)) $q->orWhere('email', $email);
                if (!empty($phone)) $q->orWhere('phone', $phone);
                if (!empty($studentCode)) $q->orWhere('student_id', $studentCode);
            })
            ->delete();

        if ($user) {
            DB::table('personal_access_tokens')
                ->where('tokenable_type', 'App\\Models\\User')
                ->where('tokenable_id', $user->id)
                ->delete();
        }
        if ($student) {
            DB::table('personal_access_tokens')
                ->where('tokenable_type', 'App\\Models\\Student')
                ->where('tokenable_id', $student->id)
                ->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'பயனர் கணக்கு முழுமையாக நீக்கப்பட்டது.'
        ]);
    }
}
