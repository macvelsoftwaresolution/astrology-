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
     * Delete a single notification
     */
    public function deleteNotification(Request $request, $id)
    {
        $user = $request->user();

        DB::table('notifications')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->delete();

        return response()->json(['success' => true, 'message' => 'Notification deleted successfully']);
    }

    /**
     * Clear all notifications for user
     */
    public function clearAllNotifications(Request $request)
    {
        $user = $request->user();

        DB::table('notifications')
            ->where('user_id', $user->id)
            ->delete();

        return response()->json(['success' => true, 'message' => 'All notifications cleared']);
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

        DB::table('system_settings')->updateOrInsert(
            ['key' => 'daily_rasi_notification_enabled'],
            ['value' => $request->enabled ? '1' : '0', 'updated_at' => now()]
        );

        return response()->json([
            'success' => true,
            'message' => $request->enabled
                ? 'தினசரி ராசி பலன் அறிவிப்பு இயக்கப்பட்டது.'
                : 'தினசரி ராசி பலன் அறிவிப்பு நிறுத்தப்பட்டது.',
            'enabled' => (bool)$request->enabled,
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
     * (100% Dynamic from Database `notifications` table - Incoming user activity ONLY)
     */
    public function getAdminActivityAlerts(Request $request)
    {
        $alerts = [];

        try {
            $adminIds = DB::table('users')->where('role', 'admin')->pluck('id')->toArray();
            $currentAdminId = $request->user() ? $request->user()->id : null;
            if ($currentAdminId && !in_array($currentAdminId, $adminIds)) {
                $adminIds[] = $currentAdminId;
            }

            // Query ONLY incoming alerts for Admin (new bookings, new book orders, new matrimony, new exam submissions)
            // Exclude outgoing notifications sent from Admin to user (e.g. 'புத்தக ஆர்டர் நிலை: Shipped', 'Packed', etc.)
            $dbNotifs = DB::table('notifications')
                ->leftJoin('users', 'notifications.user_id', '=', 'users.id')
                ->where(function ($q) use ($adminIds) {
                    if (!empty($adminIds)) {
                        $q->whereIn('notifications.user_id', $adminIds);
                    }
                    // Also include incoming customer actions
                    $q->orWhere(function ($sub) {
                        $sub->whereIn('notifications.type', ['booking', 'matrimony_registration', 'marriage_match', 'user_registration'])
                            ->orWhere(function ($bSub) {
                                $bSub->where('notifications.type', 'book_order')
                                     ->where('notifications.title', 'like', '%புத்தக ஆர்டர் பெறப்பட்டது%');
                            })
                            ->orWhere(function ($sSub) {
                                $sSub->where('notifications.type', 'submission')
                                     ->where('notifications.title', 'like', '%தேர்வு சமர்ப்பிக்கப்பட்டது%');
                            });
                    });
                })
                ->where('notifications.title', 'not like', '%புத்தக ஆர்டர் நிலை:%')
                ->select(
                    'notifications.*',
                    'users.name as user_name',
                    'users.phone as user_phone',
                    'users.role as user_role'
                )
                ->orderBy('notifications.id', 'desc')
                ->limit(30)
                ->get();

            foreach ($dbNotifs as $n) {
                $targetTab = 'overview';
                if (in_array($n->type, ['booking', 'booking_confirmed', 'booking_fulfilled'])) $targetTab = 'services';
                else if ($n->type === 'book_order') $targetTab = 'courier';
                else if ($n->type === 'submission' || $n->type === 'certificate') $targetTab = 'grading';
                else if ($n->type === 'payment' || $n->type === 'transaction') $targetTab = 'payments';
                else if ($n->type === 'marriage_match' || $n->type === 'marriage' || $n->type === 'matrimony' || $n->type === 'matrimony_registration') $targetTab = 'matrimony';
                else if ($n->type === 'jathagam') $targetTab = 'services';

                $userLabel = ($n->user_name && $n->user_role !== 'admin') ? " ({$n->user_name})" : '';

                $alerts[] = [
                    'id' => 'notif_' . $n->id,
                    'title' => $n->title . $userLabel,
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

        return response()->json([
            'success' => true,
            'alerts' => $alerts,
            'total' => count($alerts)
        ]);
    }

    /**
     * Admin: Get history of all broadcast / sent notifications from DB
     */
    public function getBroadcastHistory(Request $request)
    {
        $history = DB::table('notifications')
            ->leftJoin('users', 'notifications.user_id', '=', 'users.id')
            ->select(
                'notifications.*',
                'users.name as target_user_name',
                'users.email as target_user_email'
            )
            ->orderBy('notifications.id', 'desc')
            ->limit(100)
            ->get()
            ->map(function ($item) {
                $item->target_display = $item->user_id ? ($item->target_user_name ?: ('User #' . $item->user_id)) : 'அனைத்து பயனர்கள் (All Users)';
                return $item;
            });

        return response()->json([
            'success' => true,
            'history' => $history
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

