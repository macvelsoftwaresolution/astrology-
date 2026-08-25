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
        if (!$user) {
            return response()->json(['success' => true, 'notifications' => [], 'unread_count' => 0]);
        }

        $notifications = DB::table('notifications')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($n) {
                $n->message = $n->body ?? ($n->message ?? '');
                $n->body = $n->message;
                $n->data = $n->data ? json_decode($n->data) : null;
                return $n;
            });

        $unreadCount = $notifications->where('is_read', false)->count();

        return response()->json([
            'success'       => true,
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

        // 1. Direct Notifications (Instant Single Query)
        try {
            $dbNotifs = DB::table('notifications')
                ->orderBy('id', 'desc')
                ->limit(15)
                ->get();

            foreach ($dbNotifs as $n) {
                $targetTab = 'overview';
                if (in_array($n->type, ['booking', 'booking_confirmed'])) $targetTab = 'services';
                else if ($n->type === 'book_order') $targetTab = 'courier';
                else if ($n->type === 'submission' || $n->type === 'certificate') $targetTab = 'grading';
                else if ($n->type === 'payment') $targetTab = 'payments';
                else if ($n->type === 'marriage_match') $targetTab = 'matches';

                $alerts[] = [
                    'id' => 'notif_' . $n->id,
                    'title' => $n->title,
                    'title_en' => $n->title,
                    'message' => $n->body ?? $n->message ?? '',
                    'type' => $n->type,
                    'target_tab' => $targetTab,
                    'status' => $n->is_read ? 'Read' : 'New',
                    'badge' => $n->type,
                    'created_at' => $n->created_at,
                    'is_pending' => !$n->is_read
                ];
            }
        } catch (\Throwable $e) {}

        // 2. Recent Bookings if notifs sparse
        if (count($alerts) < 5) {
            try {
                $bookings = DB::table('bookings')->orderBy('created_at', 'desc')->limit(5)->get();
                foreach ($bookings as $b) {
                    $alerts[] = [
                        'id' => 'booking_' . $b->id,
                        'title' => 'ஜோதிட முன்பதிவு',
                        'title_en' => 'Astrology Booking',
                        'message' => ($b->user_name ?? 'வாடிக்கையாளர்') . ' - ' . ($b->service_type ?? 'ஆலோசனை'),
                        'type' => 'booking',
                        'target_tab' => 'services',
                        'status' => $b->status ?? 'Pending',
                        'badge' => '₹' . (int)$b->price,
                        'created_at' => $b->created_at,
                        'is_pending' => in_array($b->status, ['Pending'])
                    ];
                }
            } catch (\Throwable $e) {}
        }

        // Sort DESC
        usort($alerts, function ($a, $b) {
            return strtotime($b['created_at'] ?? '2000-01-01') - strtotime($a['created_at'] ?? '2000-01-01');
        });

        $alerts = array_slice($alerts, 0, 20);

        return response()->json([
            'success' => true,
            'alerts' => $alerts,
            'total' => count($alerts)
        ]);
    }

        return response()->json([
            'success' => true,
            'alerts' => $alerts,
            'total' => count($alerts)
        ]);
    }

    /**
     * Helper: Broadcast notification to all regular users
     */
    public static function broadcastToUsers(string $title, string $body, string $type, ?array $data = null): void
    {
        $users = DB::table('users')->where('role', 'user')->pluck('id');
        $now = now();
        $rows = $users->map(fn($uid) => [
            'user_id'    => $uid,
            'title'      => $title,
            'body'       => $body,
            'type'       => $type,
            'is_read'    => false,
            'data'       => $data ? json_encode($data) : null,
            'created_at' => $now,
            'updated_at' => $now
        ])->toArray();

        if (!empty($rows)) {
            DB::table('notifications')->insert($rows);
        }
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

