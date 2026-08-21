<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MatrimonyProfile;
use Illuminate\Support\Facades\DB;

class MatrimonyProfileController extends Controller
{
    /**
     * Mobile: User submits a matrimony registration
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'phone1' => 'required|string',
            'gender' => 'required|string'
        ]);

        $userId = null;
        try {
            if ($request->bearerToken()) {
                $token = DB::table('personal_access_tokens')
                    ->where('token', hash('sha256', $request->bearerToken()))
                    ->first();
                $userId = $token?->tokenable_id;
            }
        } catch (\Exception $e) {}

        $address = $request->input('address', '');
        $nativePlace = $request->input('nativePlace', '');
        $currentPlace = $request->input('currentPlace', '');

        $fullAddress = trim(implode(', ', array_filter([$address, $nativePlace, $currentPlace])));

        $profile = new MatrimonyProfile();
        $profile->user_id = $userId;
        $profile->name = $request->input('name');
        $profile->gender = $request->input('gender');
        $profile->phone_number = $request->input('phone1');
        $profile->full_address = $fullAddress;
        $profile->rasi = $request->input('rasi');
        $profile->nakshatra = $request->input('star');
        $profile->status = 'Pending';
        
        // Store everything else in extra_details
        $profile->extra_details = json_encode($request->except(['name', 'gender', 'phone1', 'rasi', 'star', 'address', 'nativePlace', 'currentPlace']));
        $profile->save();

        return response()->json([
            'success' => true,
            'message' => 'Matrimony profile registered successfully.',
            'id' => $profile->id
        ]);
    }

    /**
     * Admin: Get all matrimony profiles
     */
    public function adminIndex(Request $request)
    {
        $profiles = MatrimonyProfile::orderBy('created_at', 'desc')->get();
        
        // Decode JSON extra_details for frontend
        $profiles->transform(function ($profile) {
            if (is_string($profile->extra_details)) {
                $profile->extra_details = json_decode($profile->extra_details, true);
            }
            return $profile;
        });

        return response()->json([
            'success' => true,
            'profiles' => $profiles
        ]);
    }

    /**
     * Admin: Update profile status
     */
    public function adminUpdateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string'
        ]);

        $profile = MatrimonyProfile::findOrFail($id);
        $profile->status = $request->input('status');
        $profile->save();

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully.',
            'profile' => $profile
        ]);
    }
}
