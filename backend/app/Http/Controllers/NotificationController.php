<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the logged-in user
     */
    public function getMyNotifications(Request $request)
    {
        $user = $request->user();

        $notifications = DB::table('notifications')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($n) {
                $n->data = $n->data ? json_decode($n->data) : null;
                return $n;
            });

        $unreadCount = $notifications->where('is_read', false)->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount
        ]);
    }

    /**
     * Mark a single notification as read
     */
    public function markRead(Request $request, $id)
    {
        $user = $request->user();

        DB::table('notifications')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->update(['is_read' => true, 'updated_at' => now()]);

        return response()->json(['success' => true, 'message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllRead(Request $request)
    {
        $user = $request->user();

        DB::table('notifications')
            ->where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'updated_at' => now()]);

        return response()->json(['success' => true, 'message' => 'All notifications marked as read']);
    }

    /**
     * Admin: Broadcast notification to all users or specific user
     */
    public function broadcastNotification(Request $request)
    {
        $request->validate([
            'title'   => 'required|string',
            'body'    => 'required|string',
            'type'    => 'required|string',
            'user_id' => 'nullable|integer' // null = broadcast to all
        ]);

        if ($request->user_id) {
            // Send to specific user
            DB::table('notifications')->insert([
                'user_id'    => $request->user_id,
                'title'      => $request->title,
                'body'       => $request->body,
                'type'       => $request->type,
                'is_read'    => false,
                'data'       => $request->has('data') ? json_encode($request->data) : null,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $count = 1;
        } else {
            // Broadcast to all users
            $users = DB::table('users')->where('role', 'user')->pluck('id');
            $now = now();
            $rows = $users->map(fn($uid) => [
                'user_id'    => $uid,
                'title'      => $request->title,
                'body'       => $request->body,
                'type'       => $request->type,
                'is_read'    => false,
                'data'       => $request->has('data') ? json_encode($request->data) : null,
                'created_at' => $now,
                'updated_at' => $now
            ])->toArray();

            DB::table('notifications')->insert($rows);
            $count = count($rows);
        }

        return response()->json([
            'success' => true,
            'message' => "Notification sent to {$count} user(s)."
        ]);
    }

    /**
     * Get user's notification preferences
     */
    public function getNotificationPreferences(Request $request)
    {
        $user = $request->user();

        $profile = DB::table('users')->where('id', $user->id)->first();

        return response()->json([
            'daily_rasi_notification' => $profile->daily_rasi_notification ?? true,
        ]);
    }

    /**
     * Update user's notification preferences
     */
    public function updateNotificationPreferences(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'daily_rasi_notification' => 'required|boolean',
        ]);

        DB::table('users')
            ->where('id', $user->id)
            ->update([
                'daily_rasi_notification' => $request->daily_rasi_notification,
                'updated_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'அறிவிப்பு விருப்பத்தேர்வுகள் புதுப்பிக்கப்பட்டன.',
            'daily_rasi_notification' => $request->daily_rasi_notification,
        ]);
    }

    /**
     * Admin: Toggle global daily rasi notification feature on/off
     */
    public function toggleDailyNotificationFeature(Request $request)
    {
        $request->validate([
            'enabled' => 'required|boolean',
        ]);

        $setting = DB::table('system_settings')
            ->where('key', 'daily_rasi_notification_enabled')
            ->first();

        if ($setting) {
            DB::table('system_settings')
                ->where('key', 'daily_rasi_notification_enabled')
                ->update(['value' => $request->enabled ? '1' : '0', 'updated_at' => now()]);
        } else {
            DB::table('system_settings')->insert([
                'key' => 'daily_rasi_notification_enabled',
                'value' => $request->enabled ? '1' : '0',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => $request->enabled
                ? 'தினசரி ராசி பலன் அறிவிப்பு இயக்கப்பட்டது.'
                : 'தினசரி ராசி பலன் அறிவிப்பு நிறுத்தப்பட்டது.',
            'enabled' => $request->enabled,
        ]);
    }

    /**
     * Admin: Get daily notification feature status
     */
    public function getDailyNotificationStatus()
    {
        $setting = DB::table('system_settings')
            ->where('key', 'daily_rasi_notification_enabled')
            ->first();

        $enabled = $setting ? $setting->value === '1' : true;

        $optedInCount = DB::table('users')
            ->where('role', 'user')
            ->where('daily_rasi_notification', true)
            ->count();

        return response()->json([
            'enabled' => $enabled,
            'opted_in_users' => $optedInCount,
        ]);
    }

    /**
     * Admin: Get Live Activity Alerts for Admin Bell Notification Dropdown
     */
    public function getAdminActivityAlerts(Request $request)
    {
        $alerts = [];

        // 1. Recent Bookings
        if (DB::getSchemaBuilder()->hasTable('bookings')) {
            $bookings = DB::table('bookings')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            foreach ($bookings as $b) {
                $alerts[] = [
                    'id' => 'booking_' . $b->id,
                    'title' => 'ஜோதிட முன்பதிவு' . ($b->status === 'Pending' ? ' (புதியது)' : ''),
                    'title_en' => 'Astrology Booking' . ($b->status === 'Pending' ? ' (New)' : ''),
                    'message' => ($b->user_name ?? 'வாடிக்கையாளர்') . ' - ' . ($b->service_type ?? 'ஆலோசனை') . ' (₹' . (int)$b->price . ')',
                    'type' => 'booking',
                    'target_tab' => 'services',
                    'status' => $b->status ?? 'Pending',
                    'badge' => '₹' . (int)$b->price,
                    'created_at' => $b->created_at,
                    'is_pending' => in_array($b->status, ['Pending', 'In-Progress'])
                ];
            }
        }

        // 2. Recent Book Orders
        if (DB::getSchemaBuilder()->hasTable('book_orders')) {
            $bookOrders = DB::table('book_orders')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            foreach ($bookOrders as $bo) {
                $alerts[] = [
                    'id' => 'book_order_' . $bo->id,
                    'title' => 'புத்தக ஆர்டர்',
                    'title_en' => 'Book Order',
                    'message' => ($bo->book_title ?? 'புத்தகம்') . ' - ஆர்டர் #' . ($bo->order_number ?? $bo->id),
                    'type' => 'book_order',
                    'target_tab' => 'courier',
                    'status' => $bo->status ?? 'Processing',
                    'badge' => '₹' . (int)$bo->price,
                    'created_at' => $bo->created_at,
                    'is_pending' => in_array($bo->status, ['Processing', 'Pending'])
                ];
            }
        }

        // 3. Student Submissions
        if (DB::getSchemaBuilder()->hasTable('student_submissions')) {
            $submissions = DB::table('student_submissions')
                ->leftJoin('users', 'student_submissions.student_id', '=', 'users.id')
                ->leftJoin('courses', 'student_submissions.course_id', '=', 'courses.id')
                ->select('student_submissions.*', 'users.name as student_name', 'courses.title as course_title')
                ->orderBy('student_submissions.created_at', 'desc')
                ->limit(10)
                ->get();
            foreach ($submissions as $sub) {
                $alerts[] = [
                    'id' => 'submission_' . $sub->id,
                    'title' => 'தேர்வு சமர்ப்பிப்பு',
                    'title_en' => 'Exam Submission',
                    'message' => ($sub->student_name ?? 'மாணவர்') . ' - ' . ($sub->course_title ?? 'பாடம்') . ' (' . ($sub->score !== null ? $sub->score . ' மதிப்பெண்' : 'மதிப்பிடப்பட வேண்டும்') . ')',
                    'type' => 'submission',
                    'target_tab' => 'grading',
                    'status' => $sub->status ?? 'Pending',
                    'badge' => $sub->status ?? 'Submitted',
                    'created_at' => $sub->created_at,
                    'is_pending' => in_array($sub->status, ['Pending', 'Submitted'])
                ];
            }
        }

        // 4. Payment Transactions
        if (DB::getSchemaBuilder()->hasTable('payment_transactions')) {
            $payments = DB::table('payment_transactions')
                ->leftJoin('users', 'payment_transactions.user_id', '=', 'users.id')
                ->select('payment_transactions.*', 'users.name as user_name')
                ->orderBy('payment_transactions.created_at', 'desc')
                ->limit(10)
                ->get();
            foreach ($payments as $p) {
                $alerts[] = [
                    'id' => 'payment_' . $p->id,
                    'title' => 'கட்டணப் பரிவர்த்தனை',
                    'title_en' => 'Payment Transaction',
                    'message' => ($p->user_name ?? 'வாடிக்கையாளர்') . ' - ₹' . (int)$p->amount . ' (' . ($p->order_type ?? 'Service') . ')',
                    'type' => 'payment',
                    'target_tab' => 'payments',
                    'status' => $p->status ?? 'Paid',
                    'badge' => '₹' . (int)$p->amount,
                    'created_at' => $p->created_at,
                    'is_pending' => false
                ];
            }
        }

        // 5. Marriage Matches
        if (DB::getSchemaBuilder()->hasTable('marriage_matches')) {
            $matches = DB::table('marriage_matches')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            foreach ($matches as $m) {
                $alerts[] = [
                    'id' => 'match_' . $m->id,
                    'title' => 'திருமணப் பொருத்தம்',
                    'title_en' => 'Marriage Matching',
                    'message' => ($m->boy_name ?? 'மணமகன்') . ' & ' . ($m->girl_name ?? 'மணமகள்') . ' (' . ($m->score ?? 0) . '/10 பொருத்தம்)',
                    'type' => 'marriage_match',
                    'target_tab' => 'matches',
                    'status' => $m->admin_status ?? 'New',
                    'badge' => ($m->score ?? 0) . '/10',
                    'created_at' => $m->created_at,
                    'is_pending' => in_array($m->admin_status ?? 'New', ['New', 'Pending'])
                ];
            }
        }

        // Sort all alerts by created_at DESC
        usort($alerts, function ($a, $b) {
            return strtotime($b['created_at'] ?? '2000-01-01') - strtotime($a['created_at'] ?? '2000-01-01');
        });

        // Limit to top 25 latest alerts
        $alerts = array_slice($alerts, 0, 25);

        return response()->json([
            'success' => true,
            'alerts' => $alerts,
            'total' => count($alerts)
        ]);
    }

    /**
     * Helper: Create notification for a specific user (used internally by other controllers)
     */
    public static function createForUser(int $userId, string $title, string $body, string $type, ?array $data = null): void
    {
        DB::table('notifications')->insert([
            'user_id'    => $userId,
            'title'      => $title,
            'body'       => $body,
            'type'       => $type,
            'is_read'    => false,
            'data'       => $data ? json_encode($data) : null,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}

