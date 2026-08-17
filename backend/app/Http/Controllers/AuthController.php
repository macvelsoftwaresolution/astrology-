<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Web Portal Login (Restricted to Admin)
     */
    public function webLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password credentials.'
            ], 401);
        }

        // Web portal restriction check for student/user
        if ($user->role === 'user') {
            return response()->json([
                'success' => false,
                'is_student' => true,
                'message' => 'Student accounts are restricted to the Mobile App. Please log in using the Mobile Application.'
            ], 403);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Account is suspended or inactive. Please contact system administrator.'
            ], 403);
        }

        $token = $user->createToken('web_portal_token', [$user->role])->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone
            ]
        ]);
    }

    /**
     * Mobile App Login (Restricted to role=user only)
     */
    public function mobileLogin(Request $request)
    {
        $request->validate([
            'email'    => 'required|string',
            'password' => 'required|string',
        ]);

        $input = $request->input('email');
        $user = User::where('email', $input)->orWhere('phone', $input)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்.'
            ], 401);
        }

        // Mobile is for students/users only
        if ($user->role === 'admin') {
            return response()->json([
                'success'  => false,
                'is_admin' => true,
                'message'  => 'Admin accounts must use the Web Portal. Please visit the Admin Dashboard.'
            ], 403);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'உங்கள் கணக்கு செயலற்றது. நிர்வாகியை தொடர்புகொள்ளவும்.'
            ], 403);
        }

        $token = $user->createToken('mobile_app_token', [$user->role])->plainTextToken;

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role'  => $user->role,
            ]
        ]);
    }

    /**
     * Register new user (Mobile App)
     */
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone'    => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone,
            'role'     => 'user',
            'status'   => 'active',
        ]);

        $token = $user->createToken('mobile_app_token', ['user'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'பதிவு வெற்றிகரமாக முடிந்தது!',
            'token'   => $token,
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role'  => $user->role,
            ]
        ], 201);
    }

    /**
     * Get Current User Profile
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ]);
    }

    /**
     * Forgot Password Reset Lookup
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $input = $request->phone;
        $user = User::where('phone', $input)->orWhere('email', $input)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'கணக்கு எதுவும் பெறப்படவில்லை. தயவுசெய்து பதிவு செய்யவும்.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'உங்கள் கடவுச்சொல் மீட்பு விவரங்கள் சரிபார்க்கப்பட்டது.',
            'user' => [
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone
            ]
        ]);
    }
}
