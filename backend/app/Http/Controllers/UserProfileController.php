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
    public function adminGetUsers()
    {
        $users = DB::table('users')
            ->where('role', '!=', 'admin')
            ->select('id', 'name', 'email', 'phone', 'role', 'status', 'jathagam_details', 'created_at')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($u) {
                $u->jathagam_details = $u->jathagam_details ? json_decode($u->jathagam_details) : null;
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
     * Admin: Delete user account (Protected against deleting admins)
     */
    public function deleteUser($id)
    {
        $deleted = DB::table('users')
            ->where('id', $id)
            ->where('role', '!=', 'admin')
            ->delete();

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'நிர்வாகி கணக்குகளை இந்த பக்கத்தில் இருந்து நீக்க இயலாது.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'பயனர் கணக்கு நீக்கப்பட்டது.'
        ]);
    }
}
