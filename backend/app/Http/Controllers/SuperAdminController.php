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

    public function getPublicSeminars()
    {
        $seminars = DB::table('seminars')->orderBy('id', 'desc')->get();
        return response()->json(['seminars' => $seminars]);
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

        return response()->json(['success' => true, 'seminar' => $seminar]);
    }

    public function deleteSeminar($id)
    {
        DB::table('seminars')->where('id', $id)->delete();
        return response()->json(['success' => true, 'message' => 'Seminar deleted.']);
    }

    // ==========================================
    // COURSE MATERIALS / STUDY NOTES
    // ==========================================

    public function getPublicMaterials()
    {
        $materials = DB::table('course_materials')->orderBy('id', 'desc')->get();
        return response()->json(['materials' => $materials]);
    }

    public function saveMaterial(Request $request, $id = null)
    {
        $data = [
            'course_id' => $request->input('course_id', 1),
            'title' => $request->input('title'),
            'file_url' => $request->input('file_url'),
            'pages_text' => $request->input('pages_text', '10 பக்கங்கள்'),
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
}
