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
     * Create a new booking
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

        $orderId = 'AST-2026-' . rand(100, 999);

        DB::table('bookings')->insert([
            'id' => $orderId,
            'user_name' => $request->user_name,
            'user_phone' => $request->user_phone,
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
     * Fulfill pending booking (Upload chart/complete appointment)
     */
    public function fulfillBooking(Request $request, $id)
    {
        $request->validate([
            'chart_url' => 'nullable|string'
        ]);

        $booking = DB::table('bookings')->where('id', $id)->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        DB::table('bookings')
            ->where('id', $id)
            ->update([
                'status' => 'Completed',
                'chart_url' => $request->chart_url ?? 'horoscope_chart_' . time() . '.pdf',
                'updated_at' => now()
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking fulfilled successfully'
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
