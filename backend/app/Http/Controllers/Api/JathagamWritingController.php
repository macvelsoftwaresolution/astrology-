<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JathagamWritingController extends Controller
{
    /**
     * Create a new Jathagam Writing order
     */
    public function createOrder(Request $request)
    {
        $request->validate([
            'user_name' => 'required|string',
            'user_phone' => 'required|string',
            'price' => 'required|numeric',
            'details' => 'required|array'
        ]);

        $orderId = 'JAT-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        while (DB::table('bookings')->where('id', $orderId)->exists()) {
            $orderId = 'JAT-' . date('Ymd') . '-' . strtoupper(Str::random(8));
        }

        $userId = null;
        try {
            if ($request->bearerToken()) {
                $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken());
                $userId = $token?->tokenable_id;
            }
        } catch (\Exception $e) {}

        if (!$userId && $request->user_phone) {
            $userByPhone = DB::table('users')->where('phone', $request->user_phone)->first();
            if ($userByPhone) {
                $userId = $userByPhone->id;
            }
        }

        $details = $request->details;

        if ($request->razorpay_order_id) {
            $details['razorpay_order_id'] = $request->razorpay_order_id;
        }
        if ($request->razorpay_payment_id) {
            $details['razorpay_payment_id'] = $request->razorpay_payment_id;
            $details['payment_status'] = 'Paid';
            $details['paid_at'] = now()->toDateTimeString();
        }

        $shippingAddress = $request->shipping_address ?? $request->address ?? ($details['address'] ?? ($details['shipping_address'] ?? null));

        DB::table('bookings')->insert([
            'id' => $orderId,
            'user_name' => $request->user_name,
            'user_phone' => $request->user_phone,
            'user_id' => $userId,
            'service_type' => 'Jathagam Writing',
            'price' => $request->price,
            'shipping_address' => $shippingAddress,
            'status' => 'Pending',
            'details' => json_encode($details, JSON_UNESCAPED_UNICODE),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // If payment was completed, log transaction
        if ($request->razorpay_payment_id) {
            DB::table('payment_transactions')->updateOrInsert(
                ['razorpay_payment_id' => $request->razorpay_payment_id],
                [
                    'user_id' => $userId ?? 1,
                    'booking_id' => $orderId,
                    'order_type' => 'booking',
                    'razorpay_order_id' => $request->razorpay_order_id,
                    'amount' => $request->price ?? 0,
                    'currency' => 'INR',
                    'status' => 'Paid',
                    'description' => 'ஜாதகம் எழுதுதல் முன்பதிவு',
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }

        // Notifications
        try {
            if ($userId) {
                $isUser = DB::table('users')->where('id', $userId)->where('role', 'user')->exists();
                if ($isUser) {
                    DB::table('notifications')->insert([
                        'user_id'    => $userId,
                        'title'      => 'ஜாதகம் எழுதுதல் முன்பதிவு பெறப்பட்டது!',
                        'body'       => 'உங்கள் ஜாதகம் எழுதுதல் முன்பதிவு #' . $orderId . ' வெற்றிகரமாக பெறப்பட்டது.',
                        'type'       => 'booking',
                        'is_read'    => false,
                        'data'       => json_encode(['booking_id' => $orderId]),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Notify Admins
            $admins = DB::table('users')->where('role', 'admin')->pluck('id');
            $adminNotifs = [];
            foreach ($admins as $adminId) {
                $adminNotifs[] = [
                    'user_id'    => $adminId,
                    'title'      => 'புதிய ஜாதகம் எழுதுதல் ஆர்டர்!',
                    'title_en'   => 'New Jathagam Writing Order',
                    'body'       => 'பயனரிடமிருந்து ஜாதகம் எழுதுதல் முன்பதிவு #' . $orderId . ' வரப்பெற்றது.',
                    'type'       => 'book_order',
                    'target_tab' => 'jathagam-writing',
                    'is_read'    => false,
                    'data'       => json_encode(['booking_id' => $orderId]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            if (!empty($adminNotifs)) {
                DB::table('notifications')->insert($adminNotifs);
            }
        } catch (\Exception $e) {
            // Ignore notification errors
        }

        return response()->json([
            'success' => true,
            'message' => 'ஜாதகம் எழுதுதல் முன்பதிவு வெற்றிகரமாக முடிந்தது!',
            'booking_id' => $orderId
        ]);
    }

    /**
     * Get all Jathagam Writing orders for Admin
     */
    public function getAdminOrders(Request $request)
    {
        $orders = DB::table('bookings')
            ->where('service_type', 'Jathagam Writing')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders
        ]);
    }

    /**
     * Admin: Update Courier Dispatch Status & AWB Tracking Number for Jathagam Writing / Booking
     */
    public function updateCourierStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Pending,Processing,Packed,Shipped,Delivered,Completed',
            'awb_number' => 'nullable|string',
            'courier_partner' => 'nullable|string',
            'shipping_address' => 'nullable|string',
        ]);

        $updateData = [
            'status' => $request->status,
            'awb_number' => $request->awb_number,
            'courier_partner' => $request->courier_partner,
            'updated_at' => now(),
        ];

        if ($request->filled('shipping_address')) {
            $updateData['shipping_address'] = $request->shipping_address;
        }

        if ($request->status === 'Shipped') {
            $updateData['dispatch_date'] = now();
        }

        DB::table('bookings')->where('id', $id)->update($updateData);

        // Send Real Notification to User
        $booking = DB::table('bookings')->where('id', $id)->first();
        if ($booking && $booking->user_id) {
            try {
                $statusMap = [
                    'Pending'    => 'காத்திருப்பில் உள்ளது',
                    'Processing' => 'செயலாக்கத்தில் உள்ளது (தயாராகிறது)',
                    'Packed'     => 'பேக் செய்யப்பட்டது (பார்சல் தயார்)',
                    'Shipped'    => 'கூரியரில் அனுப்பி வைக்கப்பட்டது',
                    'Delivered'  => 'விநியோகிக்கப்பட்டது',
                    'Completed'  => 'நிறைவடைந்தது',
                ];
                $statusTa = $statusMap[$request->status] ?? $request->status;

                $partner = $request->courier_partner ?: 'Courier';
                $awbText = $request->awb_number ? " ({$partner} AWB: {$request->awb_number})" : '';

                DB::table('notifications')->insert([
                    'user_id'    => $booking->user_id,
                    'title'      => 'ஜாதகம் ஆர்டர் நிலை: ' . $statusTa,
                    'body'       => "உங்கள் ஜாதகம் எழுதுதல் ஆர்டர் #{$booking->id} நிலை: {$statusTa}{$awbText}",
                    'type'       => 'booking',
                    'target_tab' => 'profile',
                    'is_read'    => false,
                    'data'       => json_encode([
                        'booking_id'      => $booking->id,
                        'awb_number'      => $request->awb_number,
                        'courier_partner' => $request->courier_partner,
                        'status'          => $request->status
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (\Throwable $e) {}
        }

        return response()->json([
            'success' => true,
            'message' => 'Courier status updated successfully.'
        ]);
    }
}
