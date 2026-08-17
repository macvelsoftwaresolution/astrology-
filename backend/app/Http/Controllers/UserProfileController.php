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
        $profile = DB::table('users')->where('id', $user->id)->first();

        return response()->json([
            'id'               => $profile->id,
            'name'             => $profile->name,
            'email'            => $profile->email,
            'phone'            => $profile->phone,
            'address'          => $profile->address ?? null,
            'avatar_url'       => $profile->avatar_url ?? null,
            'jathagam_details' => $profile->jathagam_details
                ? json_decode($profile->jathagam_details)
                : null,
            'role'             => $profile->role,
            'status'           => $profile->status,
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'       => 'sometimes|string|max:255',
            'phone'      => 'sometimes|string|max:20',
            'address'    => 'sometimes|nullable|string',
            'avatar_url' => 'sometimes|nullable|string',
        ]);

        $updates = array_filter([
            'name'       => $request->name,
            'phone'      => $request->phone,
            'address'    => $request->address,
            'avatar_url' => $request->avatar_url,
            'updated_at' => now()
        ], fn($v) => !is_null($v));

        DB::table('users')->where('id', $user->id)->update($updates);

        return response()->json([
            'success' => true,
            'message' => 'சுயவிவரம் புதுப்பிக்கப்பட்டது.'
        ]);
    }

    /**
     * Get all bookings made by logged-in user (appointment history)
     */
    public function getMyBookings(Request $request)
    {
        $user = $request->user();

        $bookings = DB::table('bookings')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($b) {
                $b->details = $b->details ? json_decode($b->details) : null;
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

        return response()->json(['payments' => $payments]);
    }

    /**
     * Admin: Get all users list with profile details
     */
    public function adminGetUsers()
    {
        $users = DB::table('users')
            ->where('role', 'user')
            ->select('id', 'name', 'email', 'phone', 'status', 'jathagam_details', 'created_at')
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
}
