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
