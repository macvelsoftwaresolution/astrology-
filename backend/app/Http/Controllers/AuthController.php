<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Mail\StudentCredentialsMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
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

        // Web portal restriction check: ONLY admin role is permitted
        if ($user->role !== 'admin') {
            return response()->json([
                'success'    => false,
                'is_student' => ($user->role === 'user'),
                'message'    => 'நிர்வாகி கணக்குகள் மட்டுமே இந்த போர்ட்டலில் உள்நுழைய முடியும். (Only Admin accounts can log in to the Web Portal.)'
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
     * Mobile App Login (Separated between Astrology Username/Email & Learn Student ID)
     */
    public function mobileLogin(Request $request)
    {
        $request->validate([
            'email'    => 'required|string',
            'password' => 'required|string',
            'service'  => 'nullable|string',
        ]);

        $input   = trim($request->input('email'));
        $service = $request->input('service', 'astrology');

        // =====================================================================
        // 1. LEARN / EDUCATION SECTION LOGIN (Student ID + Password ONLY)
        // =====================================================================
        if ($service === 'education') {
            // Find student by Student ID (e.g. 26AR01)
            $student = Student::where('student_id', $input)->first();

            if (!$student || !Hash::check($request->password, $student->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'தவறான மாணவர் ஐடி (Student ID) அல்லது கடவுச்சொல்.'
                ], 401);
            }

            if ($student->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'உங்கள் மாணவர் கணக்கு செயலற்றது. நிர்வாகியை தொடர்புகொள்ளவும்.'
                ], 403);
            }

            $token = $student->createToken('mobile_app_token', ['user'])->plainTextToken;

            return response()->json([
                'success' => true,
                'token'   => $token,
                'user'    => [
                    'id'         => $student->id,
                    'name'       => $student->name,
                    'email'      => $student->email,
                    'phone'      => $student->phone,
                    'student_id' => $student->student_id,
                    'role'       => 'user',
                    'avatar_url' => $student->avatar_url,
                ]
            ]);
        }

        // =====================================================================
        // 2. ASTROLOGY SECTION LOGIN (Username / Email + Password ONLY)
        // =====================================================================
        $user = User::where('email', $input)
            ->orWhere('name', $input)
            ->orWhere('phone', $input)
            ->first();

        // Support demo login seamlessly
        if (!$user && $input === 'user@gmail.com' && in_array($request->password, ['123456', 'test123'])) {
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
                'message' => 'தவறான மின்னஞ்சல்/பயனர் பெயர் அல்லது கடவுச்சொல்.'
            ], 401);
        }

        // Mobile is for regular users only
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
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'role'       => $user->role,
                'avatar_url' => $user->avatar_url,
            ]
        ]);
    }

    /**
     * Register new user (Mobile App - Astrology)
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

        // Create Welcome Notification for new user
        try {
            DB::table('notifications')->insert([
                'user_id'    => $user->id,
                'title'      => 'வணக்கம்! ஆருத்ராவுக்கு நல்வரவு',
                'body'       => 'உங்கள் கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டுள்ளது. ஜோதிட ஆலோசனைகள் மற்றும் பாடநெறிகளைப் பெற வாழ்த்துகள்!',
                'type'       => 'user',
                'is_read'    => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => 'கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது.',
            'token'   => $token,
            'user'    => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'role'       => $user->role,
                'avatar_url' => $user->avatar_url,
            ]
        ], 201);
    }

    /**
     * Get Current Authenticated User Profile
     */
    public function me(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'role'       => $user->role,
                'status'     => $user->status,
                'avatar_url' => $user->avatar_url ?? null,
                'student_id' => $user->student_id ?? null,
                'batch_id'   => $user->batch_id ?? null,
                'jathagam_details' => $user->jathagam_details
                    ? (is_string($user->jathagam_details) ? json_decode($user->jathagam_details, true) : (array)$user->jathagam_details)
                    : null
            ]
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
     * Learn Student Registration with Mail Integration (Saves to dedicated 'students' table)
     */
    public function studentRegister(Request $request)
    {
        $fullName    = trim($request->input('fullName', $request->input('name', '')));
        $email       = trim($request->input('email', $request->input('emailAddress', '')));
        $phone       = trim($request->input('phone', $request->input('mobileNumber', '')));
        $courseLevel = $request->input('courseLevel', 'ilanilai');

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'success' => false,
                'message' => 'சரியான மின்னஞ்சல் முகவரி அவசியம் (Valid email address is required).'
            ], 422);
        }

        if (empty($fullName)) {
            return response()->json([
                'success' => false,
                'message' => 'மாணவர் பெயர் அவசியம் (Full name is required).'
            ], 422);
        }

        $student = Student::where('email', $email)->first();

        // User ID format: 2-digit Year + AR + 2-digit sequential number (e.g. 26AR01, 26AR02, 27AR01)
        $twoDigitYear = date('y');
        $studentCount = Student::count() + 1;
        $loginId      = $twoDigitYear . 'AR' . sprintf('%02d', $studentCount);

        // Unique secure 6-character random password (e.g. K8N9P2)
        $password = strtoupper(Str::random(6));

        // Batch Assignment (Auto or Explicit)
        $batchId = $request->input('batch_id');
        $batchName = $request->input('batch_name');
        if (!$batchId) {
            $autoBatch = BatchController::getAutoBatchForDate(now(), $courseLevel);
            if ($autoBatch) {
                $batchId = $autoBatch->id;
                $batchName = $autoBatch->name;
            }
        }

        $details = [
            'studentNameTamil' => $request->input('studentNameTamil', ''),
            'fullName'         => $fullName,
            'fatherName'       => $request->input('fatherName', ''),
            'dob'              => $request->input('dob', ''),
            'gender'           => $request->input('gender', 'ஆண்'),
            'age'              => $request->input('age', ''),
            'occupation'       => $request->input('occupation', ''),
            'motherTongue'     => $request->input('motherTongue', 'தமிழ்'),
            'postalAddress'    => $request->input('postalAddress', ''),
            'pincode'          => $request->input('pincode', ''),
            'altMobileNumber'  => $request->input('altMobileNumber', ''),
            'qualification'    => $request->input('qualification', ''),
            'courseLevel'      => $courseLevel,
            'trainingPurpose'  => $request->input('trainingPurpose', 'தொழிலாக கொள்ள'),
            'batch_id'         => $batchId,
            'batch_name'       => $batchName,
            'prevCertificate'  => $request->input('prevCertificate', ''),
            'completionYear'   => $request->input('completionYear', ''),
            'prevMarks'        => $request->input('prevMarks', ''),
            'prevUserId'       => $request->input('prevUserId', ''),
        ];

        if ($student) {
            // Update password & student_id for existing student in students table
            $loginId = $student->student_id ?: $loginId;
            $student->update([
                'name'             => $fullName,
                'student_id'       => $loginId,
                'batch_id'         => $batchId ?: $student->batch_id,
                'password'         => Hash::make($password),
                'status'           => 'active',
                'address'          => $request->input('postalAddress', $student->address),
                'jathagam_details' => json_encode($details),
                'phone'            => $phone ?: $student->phone,
            ]);
        } else {
            $student = Student::create([
                'name'             => $fullName,
                'email'            => $email,
                'student_id'       => $loginId,
                'batch_id'         => $batchId,
                'phone'            => $phone,
                'password'         => Hash::make($password),
                'status'           => 'active',
                'address'          => $request->input('postalAddress', ''),
                'jathagam_details' => json_encode($details),
            ]);
        }

        // Also synchronize with users table for web admin portal visibility
        $userRecord = User::where('email', $email)->orWhere('student_id', $loginId)->first();
        if ($userRecord) {
            $userRecord->update([
                'name'             => $fullName,
                'student_id'       => $loginId,
                'batch_id'         => $batchId ?: $userRecord->batch_id,
                'password'         => Hash::make($password),
                'role'             => 'user',
                'status'           => 'active',
                'address'          => $request->input('postalAddress', $userRecord->address),
                'jathagam_details' => json_encode($details),
                'phone'            => $phone ?: $userRecord->phone,
            ]);
        } else {
            User::create([
                'name'             => $fullName,
                'email'            => $email,
                'student_id'       => $loginId,
                'batch_id'         => $batchId,
                'phone'            => $phone ?: $loginId,
                'password'         => Hash::make($password),
                'role'             => 'user',
                'status'           => 'active',
                'address'          => $request->input('postalAddress', ''),
                'jathagam_details' => json_encode($details),
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
            'success'    => true,
            'message'    => 'மாணவர் பதிவு வெற்றிகரமாக முடிந்தது! உள்நுழைவு விவரங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டுள்ளது.',
            'login_id'   => $loginId,
            'password'   => $password,
            'email'      => $email,
            'batch_name' => $batchName,
            'user'      => [
                'id'         => $student->id,
                'name'       => $student->name,
                'email'      => $student->email,
                'phone'      => $student->phone,
                'student_id' => $student->student_id,
                'role'       => 'user',
                'batch_id' => $student->batch_id,
            ]
        ], 201);
    }

    /**
     * Fetch existing student details by Student ID for Mudhunilai enrollment
     */
    public function fetchStudentDetails(Request $request)
    {
        $request->validate([
            'query' => 'required|string',
        ]);

        $query   = trim($request->input('query'));
        $student = Student::where('student_id', $query)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'மாணவர் விவரங்கள் கிடைக்கவில்லை (Student Record Not Found).'
            ], 404);
        }

        $jathagam = $student->jathagam_details
            ? (is_string($student->jathagam_details) ? json_decode($student->jathagam_details, true) : (array)$student->jathagam_details)
            : [];

        return response()->json([
            'success' => true,
            'message' => 'இளநிலை மாணவர் விவரங்கள் வெற்றிகரமாக மீட்டெடுக்கப்பட்டன!',
            'student' => [
                'prevUserId'        => $student->student_id,
                'studentNameTamil'  => $jathagam['studentNameTamil'] ?? $student->name,
                'fullName'          => $student->name,
                'fatherName'        => $jathagam['fatherName'] ?? '',
                'dob'               => $jathagam['dob'] ?? '',
                'gender'            => $jathagam['gender'] ?? 'ஆண்',
                'age'               => $jathagam['age'] ?? '',
                'occupation'        => $jathagam['occupation'] ?? '',
                'motherTongue'      => $jathagam['motherTongue'] ?? 'தமிழ்',
                'postalAddress'     => $student->address ?: ($jathagam['postalAddress'] ?? ''),
                'pincode'           => $jathagam['pincode'] ?? '',
                'mobileNumber'      => $student->phone,
                'altMobileNumber'   => $jathagam['altMobileNumber'] ?? '',
                'emailAddress'      => $student->email,
                'qualification'     => $jathagam['qualification'] ?? '',
                'completionYear'    => $jathagam['completionYear'] ?? date('Y'),
                'prevMarks'         => $jathagam['prevMarks'] ?? '',
                'prevCertificate'   => $jathagam['prevCertificate'] ?? '',
            ]
        ]);
    }

    /**
     * Logout and revoke current token
     */
    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'வெற்றிகரமாக வெளியேறியது (Successfully logged out).'
        ]);
    }
}

