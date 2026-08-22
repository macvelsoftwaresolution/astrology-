<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SuperAdminController extends Controller
{
    /**
     * Dashboard Overview & Financial Metrics
     */
    public function getDashboardMetrics()
    {
        $data = DB::selectOne("
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'user') as total_students,
                (SELECT COUNT(*) FROM users WHERE role IN ('admin', 'super_admin')) as total_admins,
                (SELECT COUNT(*) FROM courses) as total_courses,
                (SELECT COUNT(*) FROM bookings) as total_bookings,
                (SELECT COUNT(*) FROM book_orders) as total_book_orders,
                (SELECT COALESCE(SUM(price), 0) FROM courses) as course_revenue,
                (SELECT COALESCE(SUM(price), 0) FROM bookings) as service_revenue,
                (SELECT COALESCE(SUM(price), 0) FROM book_orders) as book_revenue
        ");

        $recentAdmins = User::whereIn('role', ['admin', 'super_admin'])->get();

        $courseRevenue = (float) ($data->course_revenue ?? 0);
        $serviceRevenue = (float) ($data->service_revenue ?? 0);
        $bookRevenue = (float) ($data->book_revenue ?? 0);
        $totalRevenue = $courseRevenue + $serviceRevenue + $bookRevenue;

        return response()->json([
            'success' => true,
            'metrics' => [
                'total_students' => (int) ($data->total_students ?? 0),
                'total_admins' => (int) ($data->total_admins ?? 0),
                'total_courses' => (int) ($data->total_courses ?? 0),
                'total_bookings' => (int) ($data->total_bookings ?? 0),
                'total_book_orders' => (int) ($data->total_book_orders ?? 0),
                'total_revenue' => $totalRevenue,
                'ilanilai_applicants' => 0,
                'muthunilai_applicants' => 0,
                'revenue_breakdown' => [
                    'courses' => $courseRevenue,
                    'services' => $serviceRevenue,
                    'books' => $bookRevenue,
                ]
            ],
            'recent_admins' => $recentAdmins
        ]);
    }

    /**
     * Get All Admins
     */
    public function listAdmins()
    {
        $admins = User::whereIn('role', ['admin', 'super_admin'])->get();

        return response()->json([
            'success' => true,
            'admins' => $admins
        ]);
    }

    /**
     * Create New Admin / Astrologer Account
     */
    public function createAdmin(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
            'role' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser) {
            $existingUser->role = $request->role ?: 'admin';
            $existingUser->status = 'active';
            $existingUser->name = $request->name;
            $existingUser->password = Hash::make($request->password);
            if ($request->phone) {
                $existingUser->phone = $request->phone;
            }
            $existingUser->save();

            return response()->json([
                'success' => true,
                'message' => 'Account updated to Admin role successfully.',
                'admin' => $existingUser
            ]);
        }

        $admin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?: 'admin',
            'phone' => $request->phone,
            'status' => 'active'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin account created successfully.',
            'admin' => $admin
        ]);
    }

    /**
     * Toggle Admin Status (Active / Suspended)
     */
    public function toggleAdminStatus($id)
    {
        $admin = User::findOrFail($id);
        $admin->status = $admin->status === 'active' ? 'suspended' : 'active';
        $admin->save();

        return response()->json([
            'success' => true,
            'message' => "Admin status updated to {$admin->status}.",
            'admin' => $admin
        ]);
    }

    // ==========================================
    // APP HERO BANNERS MANAGEMENT
    // ==========================================

    public function getPublicBanners()
    {
        $banners = DB::table('app_banners')
            ->where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get();

        return response()->json(['banners' => $banners]);
    }

    public function getAdminBanners()
    {
        $banners = DB::table('app_banners')
            ->orderBy('sort_order', 'asc')
            ->get();

        return response()->json(['banners' => $banners]);
    }

    public function saveBanner(Request $request, $id = null)
    {
        $data = [
            'title' => $request->input('title', 'Banner Title'),
            'subtitle' => $request->input('subtitle', ''),
            'badge' => $request->input('badge', ''),
            'image_url' => $request->input('image_url', 'assets/images/temple_sunrise.png'),
            'link_flow' => $request->input('link_flow', 'rasi-palan'),
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => (int) $request->input('sort_order', 0),
            'updated_at' => now()
        ];

        if ($id) {
            DB::table('app_banners')->where('id', $id)->update($data);
            $banner = DB::table('app_banners')->where('id', $id)->first();
        } else {
            $data['created_at'] = now();
            $newId = DB::table('app_banners')->insertGetId($data);
            $banner = DB::table('app_banners')->where('id', $newId)->first();
        }

        return response()->json(['success' => true, 'banner' => $banner]);
    }

    public function deleteBanner($id)
    {
        DB::table('app_banners')->where('id', $id)->delete();
        return response()->json(['success' => true, 'message' => 'Banner deleted.']);
    }

    // ==========================================
    // SEMINARS & WEBINARS MANAGEMENT
    // ==========================================

    public function getPublicSeminars($level = null)
    {
        $query = DB::table('seminars');
        if ($level) {
            $query->where('level', strtoupper($level));
        }
        $seminars = $query->orderBy('id', 'desc')->get()->map(function ($s) {
            $s->status = $this->evaluateSeminarStatus($s);
            return $s;
        });
        return response()->json(['seminars' => $seminars]);
    }

    private function evaluateSeminarStatus($seminar): string
    {
        if ($seminar->status === 'past') {
            return 'past';
        }

        $timeStr = $seminar->time_text ?? '';
        $dateStr = $seminar->date_text ?? '';

        // Check if time range has end time, e.g. " - 07:30" or " - 19:30"
        if (preg_match('/-\s*(\d{1,2}):(\d{2})\s*(AM|PM|மாலை|காலை|இரவு)?/ui', $timeStr, $matches)) {
            $hour = (int)$matches[1];
            $min = (int)$matches[2];
            $meridiem = mb_strtolower($matches[3] ?? '');

            $isPm = str_contains($meridiem, 'pm') || str_contains($meridiem, 'மாலை') || str_contains($meridiem, 'இரவு')
                || str_contains(mb_strtolower($timeStr), 'மாலை') || str_contains(mb_strtolower($timeStr), 'இரவு');

            if ($isPm && $hour < 12) {
                $hour += 12;
            }

            $today = now()->format('Y-m-d');
            $isToday = str_contains(mb_strtolower($dateStr), 'இன்று') || str_contains(mb_strtolower($dateStr), 'today') || str_contains($dateStr, $today);

            if ($isToday) {
                $nowHour = (int)now()->format('H');
                $nowMin = (int)now()->format('i');
                if ($nowHour > $hour || ($nowHour === $hour && $nowMin > $min)) {
                    return 'past';
                }
            }
        }

        return $seminar->status ?? 'upcoming';
    }

    public function saveSeminar(Request $request, $id = null)
    {
        $data = [
            'title' => $request->input('title'),
            'speaker' => $request->input('speaker'),
            'date_text' => $request->input('date_text'),
            'time_text' => $request->input('time_text'),
            'status' => $request->input('status', 'upcoming'),
            'join_url' => $request->input('join_url'),
            'level' => $request->input('level', 'ILANILAI'),
            'updated_at' => now()
        ];

        if ($id) {
            DB::table('seminars')->where('id', $id)->update($data);
            $seminar = DB::table('seminars')->where('id', $id)->first();
        } else {
            $data['created_at'] = now();
            $newId = DB::table('seminars')->insertGetId($data);
            $seminar = DB::table('seminars')->where('id', $newId)->first();
        }

        // Automatic notification creation on publish/save
        if ($seminar && $seminar->status !== 'past') {
            NotificationController::broadcastToUsers(
                "🎙️ புதிய கருத்தரங்கம்: " . $seminar->title,
                ($seminar->speaker ? "வழங்குபவர்: {$seminar->speaker} | " : "") . "நேரம்: {$seminar->date_text} {$seminar->time_text}",
                'seminar',
                [
                    'join_url' => $seminar->join_url,
                    'seminar_id' => $seminar->id,
                    'date_text' => $seminar->date_text,
                    'time_text' => $seminar->time_text
                ]
            );
        }

        return response()->json(['success' => true, 'seminar' => $seminar]);
    }

    public function deleteSeminar($id)
    {
        DB::table('seminars')->where('id', $id)->delete();
        // Remove associated notifications automatically
        DB::table('notifications')
            ->where('data->seminar_id', $id)
            ->delete();
        return response()->json(['success' => true, 'message' => 'Seminar deleted.']);
    }

    // ==========================================
    // COURSE MATERIALS / STUDY NOTES
    // ==========================================

    public function getPublicMaterials($level = null)
    {
        $query = DB::table('course_materials');
        if ($level) {
            $query->where('level', strtoupper($level));
        }
        $materials = $query->orderBy('id', 'desc')->get();
        return response()->json(['materials' => $materials]);
    }

    public function saveMaterial(Request $request, $id = null)
    {
        $data = [
            'course_id' => $request->input('course_id', 1),
            'title' => $request->input('title'),
            'file_url' => $request->input('file_url'),
            'pages_text' => $request->input('pages_text', '10 பக்கங்கள்'),
            'level' => $request->input('level', 'ILANILAI'),
            'updated_at' => now()
        ];

        if ($id) {
            DB::table('course_materials')->where('id', $id)->update($data);
            $mat = DB::table('course_materials')->where('id', $id)->first();
        } else {
            $data['created_at'] = now();
            $newId = DB::table('course_materials')->insertGetId($data);
            $mat = DB::table('course_materials')->where('id', $newId)->first();
        }

        return response()->json(['success' => true, 'material' => $mat]);
    }

    public function deleteMaterial($id)
    {
        DB::table('course_materials')->where('id', $id)->delete();
        return response()->json(['success' => true, 'message' => 'Material deleted.']);
    }

    // ==========================================
    // LIVE CLASS SETTINGS (For Mobile Banner)
    // ==========================================

    public function getLiveClassInfo($level = null)
    {
        $query = DB::table('live_classes');
        if ($level) {
            $query->where('level', strtoupper($level));
        }
        $todayShort = strtolower(now()->format('D')); // mon, tue, wed, thu, fri, sat, sun
        $todayTamil = match($todayShort) {
            'mon' => 'திங்கள்',
            'tue' => 'செவ்வாய்',
            'wed' => 'புதன்',
            'thu' => 'வியாழன்',
            'fri' => 'வெள்ளி',
            'sat' => 'சனி',
            'sun' => 'ஞாயிறு',
            default => ''
        };

        $liveClasses = $query->orderBy('created_at', 'desc')->get()->map(function ($lc) use ($todayShort, $todayTamil) {
            $days = [];
            if ($lc->days_of_week) {
                $days = is_string($lc->days_of_week) ? json_decode($lc->days_of_week, true) : (array)$lc->days_of_week;
            }
            $lc->days_of_week = $days ?: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
            $lc->is_today = empty($days) || in_array($todayShort, $lc->days_of_week);
            $lc->today_name = $todayTamil;
            return $lc;
        });

        return response()->json([
            'success' => true,
            'data' => $liveClasses
        ]);
    }

    public function saveLiveClassInfo(Request $request, $id = null)
    {
        $days = $request->input('days_of_week', []);
        if (is_string($days)) {
            $decoded = json_decode($days, true);
            $days = is_array($decoded) ? $decoded : array_map('trim', explode(',', $days));
        }

        $data = [
            'title' => $request->input('title', 'நேரடி வகுப்பு'),
            'description' => $request->input('description', ''),
            'days_of_week' => json_encode($days),
            'date_text' => $request->input('date_text', 'இன்று'),
            'time_text' => $request->input('time_text', 'மாலை 06:00 - 07:30'),
            'start_time' => $request->input('start_time', '18:00'),
            'end_time' => $request->input('end_time', '19:30'),
            'link' => $request->input('link', ''),
            'is_active' => $request->boolean('is_active', false),
            'level' => $request->input('level', 'ILANILAI'),
            'updated_at' => now()
        ];

        if ($id) {
            DB::table('live_classes')->where('id', $id)->update($data);
            $liveClass = DB::table('live_classes')->where('id', $id)->first();
        } else {
            $data['created_at'] = now();
            $newId = DB::table('live_classes')->insertGetId($data);
            $liveClass = DB::table('live_classes')->where('id', $newId)->first();
        }

        // Automatic notification creation on active live class publish
        if ($liveClass && $liveClass->is_active) {
            NotificationController::broadcastToUsers(
                "🔴 நேரலை வகுப்பு: " . $liveClass->title,
                ($liveClass->description ? "{$liveClass->description} | " : "") . "நேரம்: {$liveClass->date_text} {$liveClass->time_text}",
                'course',
                [
                    'link' => $liveClass->link,
                    'live_class_id' => $liveClass->id,
                    'level' => $liveClass->level,
                    'date_text' => $liveClass->date_text,
                    'time_text' => $liveClass->time_text,
                    'days_of_week' => $days
                ]
            );
        } else if ($liveClass && !$liveClass->is_active) {
            // When deactivated, remove past live notifications
            DB::table('notifications')
                ->where('data->live_class_id', $liveClass->id)
                ->delete();
        }

        return response()->json(['success' => true, 'data' => $liveClass]);
    }

    public function deleteLiveClass($id)
    {
        DB::table('live_classes')->where('id', $id)->delete();
        // Remove associated notifications automatically
        DB::table('notifications')
            ->where('data->live_class_id', $id)
            ->delete();
        return response()->json(['success' => true, 'message' => 'Live class deleted.']);
    }
}
