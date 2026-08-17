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
        $totalUsers = User::where('role', 'user')->count();
        $totalAdmins = User::where('role', 'admin')->count();
        $totalCourses = DB::table('courses')->count();
        $totalBookings = DB::table('bookings')->count();
        $totalBookOrders = DB::table('book_orders')->count();

        $courseRevenue = DB::table('courses')->sum('price');
        $serviceRevenue = DB::table('bookings')->sum('price');
        $bookRevenue = DB::table('book_orders')->sum('price');
        $totalRevenue = $courseRevenue + $serviceRevenue + $bookRevenue;

        $recentAdmins = User::whereIn('role', ['admin', 'super_admin'])->get();

        return response()->json([
            'success' => true,
            'metrics' => [
                'total_students' => $totalUsers,
                'total_admins' => $totalAdmins,
                'total_courses' => $totalCourses,
                'total_bookings' => $totalBookings,
                'total_book_orders' => $totalBookOrders,
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
}
