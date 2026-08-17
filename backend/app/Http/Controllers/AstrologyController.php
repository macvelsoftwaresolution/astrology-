<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Razorpay\Api\Api;

class AstrologyController extends Controller
{
    // ================= USER MOBILE ENDPOINTS =================

    /**
     * Get today's Panchangam
     */
    public function getTodayPanchangam(Request $request)
    {
        $today = date('Y-m-d');
        $panchangam = DB::table('panchangams')->where('date', $today)->first();

        if (!$panchangam) {
            // Return default fallback if not seeded
            return response()->json([
                'date' => $today,
                'thithi' => 'ஏகாதசி (Ekadashi)',
                'star' => 'ரோகினி (Rohini)',
                'rahukalam' => '10:30 AM - 12:00 PM',
                'yamagandam' => '09:15 AM - 10:15 AM',
                'nalla_neram' => '06:15 AM - 07:15 AM'
            ]);
        }

        return response()->json($panchangam);
    }

    /**
     * Get Rasi Palan predictions
     */
    public function getRasiPalan(Request $request)
    {
        $date = $request->input('date', date('Y-m-d'));
        $tabType = $request->input('type', 'daily');

        $predictions = DB::table('rasi_palans')
            ->where('prediction_date', $date)
            ->where('tab_type', $tabType)
            ->get();

        return response()->json($predictions);
    }

    /**
     * Create a new booking (with date availability check)
     */
    public function createBooking(Request $request)
    {
        $request->validate([
            'user_name' => 'required|string',
            'user_phone' => 'required|string',
            'service_type' => 'required|string',
            'price' => 'required|numeric',
            'details' => 'required|array'
        ]);

        // Check if requested date is marked as busy/blocked by Astrologer
        $requestedDate = $request->input('booking_date') 
            ?? ($request->details['preferred_date'] ?? ($request->details['booking_date'] ?? null));

        if ($requestedDate) {
            $isBlocked = DB::table('astrologer_availabilities')
                ->where('date', $requestedDate)
                ->where('status', 'busy')
                ->first();

            if ($isBlocked) {
                $reason = $isBlocked->reason ? " ({$isBlocked->reason})" : '';
                return response()->json([
                    'success' => false,
                    'message' => "மன்னிக்கவும்! தேர்ந்தெடுக்கப்பட்ட தேதியில் ({$requestedDate}) ஜோதிடர் வேறு ஆன்மீக நிகழ்வுகளில் இருப்பதால் முன்பதிவு முடக்கப்பட்டுள்ளது{$reason}. தயவுசெய்து மாற்று தேதியை தேர்வு செய்யவும்."
                ], 422);
            }
        }

        $orderId = 'AST-2026-' . rand(100, 999);

        // Check for authenticated user token
        $userId = null;
        try {
            if ($request->bearerToken()) {
                $token = DB::table('personal_access_tokens')
                    ->where('token', hash('sha256', $request->bearerToken()))
                    ->first();
                $userId = $token?->tokenable_id;
            }
        } catch (\Exception $e) {}

        DB::table('bookings')->insert([
            'id' => $orderId,
            'user_name' => $request->user_name,
            'user_phone' => $request->user_phone,
            'user_id' => $userId,
            'service_type' => $request->service_type,
            'price' => $request->price,
            'status' => 'Pending',
            'details' => json_encode($request->details),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking initialized successfully',
            'order_id' => $orderId,
            'price' => $request->price
        ], 201);
    }

    /**
     * Get Public Calendar Availability (Blocked / Busy dates)
     */
    public function getAvailability()
    {
        $today = date('Y-m-d');
        $blocked = DB::table('astrologer_availabilities')
            ->where('date', '>=', $today)
            ->where('status', 'busy')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'blocked_dates' => $blocked->pluck('date')->toArray(),
            'details' => $blocked
        ]);
    }

    /**
     * Create a Razorpay Order ID
     */
    public function createRazorpayOrder(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric'
        ]);

        try {
            $api = new Api(env('RAZORPAY_KEY_ID'), env('RAZORPAY_KEY_SECRET'));

            $orderData = [
                'receipt'         => 'rcpt_' . time(),
                'amount'          => $request->amount * 100, // Razorpay amount is in paise
                'currency'        => 'INR'
            ];

            $razorpayOrder = $api->order->create($orderData);

            return response()->json([
                'success' => true,
                'order_id' => $razorpayOrder['id'],
                'amount' => $request->amount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create Razorpay order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify payment status using Razorpay Cryptographic Signature
     */
    public function verifyPayment(Request $request)
    {
        $request->validate([
            'order_id' => 'required|string',
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string'
        ]);

        try {
            $api = new Api(env('RAZORPAY_KEY_ID'), env('RAZORPAY_KEY_SECRET'));

            $attributes = [
                'razorpay_order_id' => $request->razorpay_order_id,
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'razorpay_signature' => $request->razorpay_signature
            ];

            // This will throw a SignatureVerificationError if signature is invalid
            $api->utility->verifyPaymentSignature($attributes);

            // Fetch and update the booking status to marked as paid (Pending for astrologer fulfillment)
            DB::table('bookings')
                ->where('id', $request->order_id)
                ->update([
                    'status' => 'Pending',
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment verified and booking updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment signature verification failed: ' . $e->getMessage()
            ], 400);
        }
    }

    // ================= ADMIN WEB ENDPOINTS =================

    /**
     * Get all bookings for Admin
     */
    public function getAdminBookings()
    {
        $bookings = DB::table('bookings')->orderBy('created_at', 'desc')->get();
        
        // Decode JSON details back
        foreach ($bookings as $b) {
            $b->details = json_decode($b->details);
        }

        return response()->json($bookings);
    }

    /**
     * Admin: Get all Astrologer Availability & Blocked Dates
     */
    public function getAdminAvailability()
    {
        $records = DB::table('astrologer_availabilities')
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                $item->date = date('Y-m-d', strtotime($item->date));
                return $item;
            });

        return response()->json([
            'success' => true,
            'records' => $records
        ]);
    }

    /**
     * Admin: Toggle a date as Busy / Blocked or Available / Free
     */
    public function toggleDateAvailability(Request $request)
    {
        $request->validate([
            'date' => 'required',
            'status' => 'required|string', // 'busy' or 'available'
            'reason' => 'nullable|string'  // e.g. கோவில் பூஜை, விடுப்பு
        ]);

        $date = date('Y-m-d', strtotime($request->date));
        $status = strtolower($request->status);

        if ($status === 'busy' || $status === 'blocked') {
            DB::table('astrologer_availabilities')->updateOrInsert(
                ['date' => $date],
                [
                    'status' => 'busy',
                    'reason' => $request->reason ?: 'ஜோதிடர் முன்பதிவு நிறுத்தம் (Busy / Blocked)',
                    'updated_at' => now()
                ]
            );
            return response()->json([
                'success' => true,
                'message' => "தேதி ({$date}) வெற்றிகரமாக முன்பதிவு முடக்கப்பட்டது (Marked as Busy)."
            ]);
        } else {
            DB::table('astrologer_availabilities')->where('date', $date)->delete();
            return response()->json([
                'success' => true,
                'message' => "தேதி ({$date}) முன்பதிவுக்கு திறக்கப்பட்டது (Marked as Free / Available)."
            ]);
        }
    }

    /**
     * Admin: Delete/Unblock availability
     */
    public function deleteAvailability($id)
    {
        DB::table('astrologer_availabilities')->where('id', $id)->delete();
        return response()->json(['success' => true, 'message' => 'Date unblocked successfully']);
    }

    /**
     * Fulfill/Update booking (Upload chart, update consultation status)
     */
    public function fulfillBooking(Request $request, $id)
    {
        $request->validate([
            'status' => 'nullable|string',
            'chart_url' => 'nullable|string'
        ]);

        $booking = DB::table('bookings')->where('id', $id)->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        $status = $request->status ?: 'Completed';

        DB::table('bookings')
            ->where('id', $id)
            ->update([
                'status' => $status,
                'chart_url' => $request->chart_url ?? $booking->chart_url,
                'updated_at' => now()
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking status updated successfully'
        ]);
    }

    /**
     * Admin: Delete a booking
     */
    public function deleteBooking($id)
    {
        DB::table('bookings')->where('id', $id)->delete();
        return response()->json([
            'success' => true,
            'message' => "முன்பதிவு (#{$id}) வெற்றிகரமாக நீக்கப்பட்டது (Booking Deleted successfully)."
        ]);
    }

    /**
     * Update today's Panchangam
     */
    public function updatePanchangam(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'thithi' => 'required|string',
            'star' => 'required|string',
            'rahukalam' => 'required|string',
            'yamagandam' => 'required|string',
            'nalla_neram' => 'required|string'
        ]);

        DB::table('panchangams')->updateOrInsert(
            ['date' => $request->date],
            [
                'thithi' => $request->thithi,
                'star' => $request->star,
                'rahukalam' => $request->rahukalam,
                'yamagandam' => $request->yamagandam,
                'nalla_neram' => $request->nalla_neram,
                'updated_at' => now()
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Panchangam updated successfully'
        ]);
    }

    /**
     * Update daily Rasi Palan predictions
     */
    public function updateRasiPalan(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'type' => 'required|string', // daily, weekly...
            'predictions' => 'required|array' // array of ['rasi_name' => '...', 'prediction_text' => '...']
        ]);

        foreach ($request->predictions as $p) {
            DB::table('rasi_palans')->updateOrInsert(
                [
                    'prediction_date' => $request->date,
                    'rasi_name' => $p['rasi_name'],
                    'tab_type' => $request->type
                ],
                [
                    'prediction_text' => $p['prediction_text'],
                    'audio_url' => $p['audio_url'] ?? null,
                    'video_url' => $p['video_url'] ?? null,
                    'updated_at' => now()
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Rasi Palan predictions updated successfully'
        ]);
    }
}
