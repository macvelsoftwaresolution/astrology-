<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\StudentCredentialsMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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

        $input = trim($request->input('email'));
        $user = User::where('email', $input)
            ->orWhere('phone', $input)
            ->orWhere('student_id', $input)
            ->first();

        // Support demo login seamlessly
        if (!$user && $input === '9876543210' && in_array($request->password, ['123456', 'test123'])) {
            $user = User::create([
                'name'     => 'Karthik',
                'email'    => 'user@gmail.com',
                'phone'    => '9876543210',
                'password' => Hash::make($request->password),
                'role'     => 'user',
                'status'   => 'active',
            ]);
        }

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

    /**
     * Learn Student Registration with Mail Integration
     */
    public function studentRegister(Request $request)
    {
        $request->validate([
            'fullName'    => 'required|string|max:255',
            'email'       => 'required|email',
            'phone'       => 'nullable|string',
            'courseLevel' => 'nullable|string',
        ]);

        $fullName    = trim($request->input('fullName'));
        $email       = trim($request->input('email'));
        $phone       = trim($request->input('phone', ''));
        $courseLevel = $request->input('courseLevel', 'ilanilai');

        $user = User::where('email', $email)->first();

        // User ID format: 2-digit Year + AR + 2-digit sequential number (e.g. 26AR01, 26AR02, 27AR01)
        $twoDigitYear = date('y');
        $studentCount = User::where('role', 'user')->count() + 1;
        $loginId      = $twoDigitYear . 'AR' . sprintf('%02d', $studentCount);

        // Unique secure 6-character random password (e.g. K8N9P2)
        $password = strtoupper(Str::random(6));

        if ($user) {
            // Update password & student_id for existing student
            $loginId = $user->student_id ?: $loginId;
            $user->update([
                'name'       => $fullName,
                'student_id' => $loginId,
                'password'   => Hash::make($password),
                'status'     => 'active',
            ]);
            if ($phone) {
                $user->update(['phone' => $phone]);
            }
        } else {
            $user = User::create([
                'name'       => $fullName,
                'email'      => $email,
                'student_id' => $loginId,
                'phone'      => $phone ?: $loginId,
                'password'   => Hash::make($password),
                'role'       => 'user',
                'status'     => 'active',
            ]);
        }

        // Send Email Notification to Student
        try {
            Mail::to($email)->send(new StudentCredentialsMail($fullName, $email, $loginId, $password, $courseLevel));
            Log::info("Student credentials email dispatched successfully to: {$email}");
        } catch (\Throwable $e) {
            Log::error("Failed to send student credentials email to {$email}: " . $e->getMessage());
        }

        return response()->json([
            'success'   => true,
            'message'   => 'மாணவர் பதிவு வெற்றிகரமாக முடிந்தது! உள்நுழைவு விவரங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டுள்ளது.',
            'login_id'  => $loginId,
            'password'  => $password,
            'email'     => $email,
            'user'      => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role'  => $user->role,
            ]
        ], 201);
    }
}
