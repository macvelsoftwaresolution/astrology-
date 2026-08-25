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
     * Get today's Panchangam (Dynamic from DB)
     */
    public function getTodayPanchangam(Request $request)
    {
        $today = $request->input('date', date('Y-m-d'));
        $panchangam = DB::table('panchangams')->where('date', $today)->first();

        if (!$panchangam) {
            $panchangam = DB::table('panchangams')->orderBy('date', 'desc')->first();
        }

        if (!$panchangam) {
            // Return empty response if no panchangam is found at all
            return response()->json([
                'success' => true,
                'panchangam' => null,
                'date' => $today,
                'thithi' => '-',
                'star' => '-',
                'rahukalam' => '-',
                'yamagandam' => '-',
                'nalla_neram' => '-'
            ]);
        }

        return response()->json([
            'success' => true,
            'panchangam' => $panchangam,
            'date' => $panchangam->date,
            'thithi' => $panchangam->thithi,
            'star' => $panchangam->star,
            'rahukalam' => $panchangam->rahukalam,
            'yamagandam' => $panchangam->yamagandam,
            'nalla_neram' => $panchangam->nalla_neram ?? '-'
        ]);
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

        // Generate guaranteed unique Order ID
        $orderId = $request->input('booking_id') 
            ?? (is_array($request->details) && isset($request->details['booking_ref']) ? $request->details['booking_ref'] : null)
            ?? ('AST-' . date('Ymd') . '-' . strtoupper(Str::random(6)));

        while (DB::table('bookings')->where('id', $orderId)->exists()) {
            $orderId = 'AST-' . date('Ymd') . '-' . strtoupper(Str::random(8));
        }

        // Check for authenticated user token or lookup by phone
        $userId = null;
        try {
            $bearerToken = $request->bearerToken();
            if ($bearerToken) {
                if (str_contains($bearerToken, '|')) {
                    [$id, $plainToken] = explode('|', $bearerToken, 2);
                    $pat = DB::table('personal_access_tokens')
                        ->where('id', $id)
                        ->first();
                    if ($pat && hash_equals($pat->token, hash('sha256', $plainToken))) {
                        $userId = $pat->tokenable_id;
                    }
                } else {
                    $pat = DB::table('personal_access_tokens')
                        ->where('token', hash('sha256', $bearerToken))
                        ->first();
                    $userId = $pat?->tokenable_id;
                }
            }
        } catch (\Exception $e) {}

        if (!$userId && $request->user_phone) {
            $userByPhone = DB::table('users')->where('phone', $request->user_phone)->first();
            if ($userByPhone) {
                $userId = $userByPhone->id;
            }
        }

        // Build details payload
        $details = is_array($request->details) ? $request->details : (is_string($request->details) ? json_decode($request->details, true) : []);
        if (!$details) $details = [];

        if (!isset($details['date']) && $request->preferred_date) {
            $details['date'] = $request->preferred_date;
        }
        if (!isset($details['slot']) && $request->preferred_time) {
            $details['slot'] = $request->preferred_time;
        }
        if ($request->razorpay_order_id) {
            $details['razorpay_order_id'] = $request->razorpay_order_id;
        }
        if ($request->razorpay_payment_id) {
            $details['razorpay_payment_id'] = $request->razorpay_payment_id;
            $details['payment_status'] = 'Paid';
            $details['paid_at'] = now()->toDateTimeString();
        }

        DB::table('bookings')->insert([
            'id' => $orderId,
            'user_name' => $request->user_name,
            'user_phone' => $request->user_phone,
            'user_id' => $userId,
            'service_type' => $request->service_type,
            'price' => $request->price,
            'status' => 'Pending',
            'details' => json_encode($details, JSON_UNESCAPED_UNICODE),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // If payment was completed, log transaction (avoid duplicate)
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
                    'description' => 'ஜோதிட ஆலோசனை முன்பதிவு - ' . ($details['astrologer_name'] ?? $request->service_type),
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }

        // Insert Real Notification for User
        if ($userId) {
            try {
                DB::table('notifications')->insert([
                    'user_id'    => $userId,
                    'title'      => 'முன்பதிவு பெறப்பட்டது! (Booking Received)',
                    'body'       => 'உங்கள் ' . ($request->service_type ?: 'ஜோதிட ஆலோசனை') . ' முன்பதிவு #' . $orderId . ' பெறப்பட்டது.',
                    'type'       => 'booking',
                    'is_read'    => false,
                    'data'       => json_encode(['booking_id' => $orderId]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (\Throwable $e) {}
        }

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

        $keyId = trim(config('services.razorpay.key_id') ?: env('RAZORPAY_KEY_ID', ''));
        $keySecret = trim(config('services.razorpay.key_secret') ?: env('RAZORPAY_KEY_SECRET', ''));

        // Auto-correct missing rzp_test_ / rzp_live_ prefix
        if ($keyId && !str_starts_with($keyId, 'rzp_test_') && !str_starts_with($keyId, 'rzp_live_') && !str_contains($keyId, 'yourKeyId')) {
            $keyId = 'rzp_test_' . $keyId;
        }

        try {
            if ($keyId && $keySecret && !str_contains($keyId, 'yourKeyId')) {
                $api = new Api($keyId, $keySecret);

                $orderData = [
                    'receipt'         => 'rcpt_' . time(),
                    'amount'          => intval(round($request->amount * 100)), // in paise
                    'currency'        => 'INR'
                ];

                $razorpayOrder = $api->order->create($orderData);

                return response()->json([
                    'success' => true,
                    'order_id' => $razorpayOrder['id'],
                    'amount' => $request->amount,
                    'key_id' => $keyId,
                    'currency' => 'INR'
                ]);
            } else {
                // If keys not yet filled in .env or demo mode
                return response()->json([
                    'success' => true,
                    'order_id' => 'order_demo_' . time(),
                    'amount' => $request->amount,
                    'key_id' => $keyId ?: 'rzp_test_demo',
                    'currency' => 'INR',
                    'is_demo' => true
                ]);
            }
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
            'razorpay_order_id' => 'nullable|string',
            'razorpay_payment_id' => 'nullable|string',
            'razorpay_signature' => 'nullable|string'
        ]);

        $keyId = trim(config('services.razorpay.key_id') ?: env('RAZORPAY_KEY_ID', ''));
        $keySecret = trim(config('services.razorpay.key_secret') ?: env('RAZORPAY_KEY_SECRET', ''));

        if ($keyId && !str_starts_with($keyId, 'rzp_test_') && !str_starts_with($keyId, 'rzp_live_') && !str_contains($keyId, 'yourKeyId')) {
            $keyId = 'rzp_test_' . $keyId;
        }

        try {
            if ($request->razorpay_signature && $keyId && $keySecret && !str_contains($keyId, 'yourKeyId')) {
                $api = new Api($keyId, $keySecret);

                $attributes = [
                    'razorpay_order_id' => $request->razorpay_order_id,
                    'razorpay_payment_id' => $request->razorpay_payment_id,
                    'razorpay_signature' => $request->razorpay_signature
                ];

                $api->utility->verifyPaymentSignature($attributes);
            }

            // Fetch booking
            $booking = DB::table('bookings')->where('id', $request->order_id)->first();

            // Record transaction if not already logged (avoid duplicate)
            if ($booking) {
                DB::table('payment_transactions')->updateOrInsert(
                    ['razorpay_payment_id' => $request->razorpay_payment_id],
                    [
                        'user_id' => $booking->user_id ?? 1,
                        'booking_id' => $request->order_id,
                        'order_type' => 'booking',
                        'razorpay_order_id' => $request->razorpay_order_id,
                        'amount' => $booking->price ?? 0,
                        'currency' => 'INR',
                        'status' => 'Paid',
                        'description' => 'ஜோதிட ஆலோசனை முன்பதிவு கட்டணம்',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]
                );

                // Update booking
                DB::table('bookings')
                    ->where('id', $request->order_id)
                    ->update([
                        'status' => 'Pending',
                        'updated_at' => now()
                    ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment verified and booking updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment signature verification: ' . $e->getMessage()
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

    private function parseJsonField($val)
    {
        if (is_array($val)) return $val;
        if (is_string($val)) {
            $decoded = json_decode($val, true);
            return is_array($decoded) ? $decoded : [];
        }
        return [];
    }

    // ================= ASTROLOGERS CRUD & AVAILABILITY =================

    /**
     * Get All Astrologers (Public & Admin)
     */
    public function getAstrologers(Request $request)
    {
        $astrologers = DB::table('astrologers')->orderBy('id', 'asc')->get();

        $formatted = $astrologers->map(function ($a) {
            $a->available_slots = $this->parseJsonField($a->available_slots);
            $a->blocked_dates = $this->parseJsonField($a->blocked_dates);
            return $a;
        });

        return response()->json([
            'success' => true,
            'astrologers' => $formatted
        ]);
    }

    /**
     * Admin: Create New Astrologer
     */
    public function createAstrologer(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role_title' => 'nullable|string|max:255',
            'fee' => 'nullable|numeric',
        ]);

        $defaultSlots = [
            '10:00 AM - 11:00 AM',
            '11:30 AM - 12:30 PM',
            '03:30 PM - 04:30 PM',
            '05:00 PM - 06:00 PM',
            '06:30 PM - 07:30 PM'
        ];

        $slots = $request->has('available_slots') 
            ? (is_array($request->available_slots) ? $request->available_slots : json_decode($request->available_slots, true)) 
            : $defaultSlots;

        $blockedDates = $request->has('blocked_dates') 
            ? (is_array($request->blocked_dates) ? $request->blocked_dates : json_decode($request->blocked_dates, true)) 
            : [];

        $id = DB::table('astrologers')->insertGetId([
            'name' => $request->input('name'),
            'category' => $request->input('category', 'ஜாதகம் எழுதுதல்'),
            'role_title' => $request->input('role_title', 'வேத ஜோதிடர்'),
            'experience' => $request->input('experience', '10+ ஆண்டுகள்'),
            'specialty' => $request->input('specialty', 'ஜாதகக் கணிப்பு, திருமணப் பொருத்தம்'),
            'fee' => $request->input('fee', 499.00),
            'phone' => $request->input('phone', ''),
            'bio' => $request->input('bio', ''),
            'avatar_icon' => $request->input('avatar_icon', 'bi bi-person-fill'),
            'avatar_url' => $request->input('avatar_url', null),
            'is_phone_call_available' => filter_var($request->input('is_phone_call_available', true), FILTER_VALIDATE_BOOLEAN),
            'phone_call_fee' => $request->input('phone_call_fee', 499.00),
            'is_video_call_available' => filter_var($request->input('is_video_call_available', true), FILTER_VALIDATE_BOOLEAN),
            'video_call_fee' => $request->input('video_call_fee', 699.00),
            'is_audio_call_available' => filter_var($request->input('is_audio_call_available', true), FILTER_VALIDATE_BOOLEAN),
            'audio_call_fee' => $request->input('audio_call_fee', 499.00),
            'available_slots' => json_encode($slots ?: []),
            'blocked_dates' => json_encode($blockedDates ?: []),
            'status' => $request->input('status', 'Available'),
            'rating' => $request->input('rating', 4.90),
            'consultation_count' => $request->input('consultation_count', 0),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $newAstro = DB::table('astrologers')->where('id', $id)->first();
        $newAstro->available_slots = $this->parseJsonField($newAstro->available_slots);
        $newAstro->blocked_dates = $this->parseJsonField($newAstro->blocked_dates);

        return response()->json([
            'success' => true,
            'message' => "ஜோதிடர் ({$newAstro->name}) வெற்றிகரமாக சேர்க்கப்பட்டார்.",
            'astrologer' => $newAstro
        ], 201);
    }

    /**
     * Admin: Update Astrologer Profile & Settings
     */
    public function updateAstrologer(Request $request, $id)
    {
        $astro = DB::table('astrologers')->where('id', $id)->first();
        if (!$astro) {
            return response()->json(['success' => false, 'message' => 'Astrologer not found'], 404);
        }

        $updateData = [
            'name' => $request->input('name', $astro->name),
            'category' => $request->input('category', $astro->category ?? 'ஜாதகம் எழுதுதல்'),
            'role_title' => $request->input('role_title', $astro->role_title),
            'experience' => $request->input('experience', $astro->experience),
            'specialty' => $request->input('specialty', $astro->specialty),
            'fee' => $request->input('fee', $astro->fee),
            'phone' => $request->input('phone', $astro->phone),
            'bio' => $request->input('bio', $astro->bio),
            'status' => $request->input('status', $astro->status),
            'rating' => $request->input('rating', $astro->rating),
            'consultation_count' => $request->input('consultation_count', $astro->consultation_count ?? 500),
            'avatar_url' => $request->input('avatar_url', $astro->avatar_url ?? null),
            'avatar_icon' => $request->input('avatar_icon', $astro->avatar_icon ?? 'bi bi-person-fill'),
            'is_phone_call_available' => $request->has('is_phone_call_available') ? filter_var($request->input('is_phone_call_available'), FILTER_VALIDATE_BOOLEAN) : ($astro->is_phone_call_available ?? true),
            'phone_call_fee' => $request->input('phone_call_fee', $astro->phone_call_fee ?? 499.00),
            'is_video_call_available' => $request->has('is_video_call_available') ? filter_var($request->input('is_video_call_available'), FILTER_VALIDATE_BOOLEAN) : ($astro->is_video_call_available ?? true),
            'video_call_fee' => $request->input('video_call_fee', $astro->video_call_fee ?? 699.00),
            'is_audio_call_available' => $request->has('is_audio_call_available') ? filter_var($request->input('is_audio_call_available'), FILTER_VALIDATE_BOOLEAN) : ($astro->is_audio_call_available ?? true),
            'audio_call_fee' => $request->input('audio_call_fee', $astro->audio_call_fee ?? 499.00),
            'updated_at' => now()
        ];

        if ($request->has('available_slots')) {
            $slots = is_array($request->available_slots) ? $request->available_slots : json_decode($request->available_slots, true);
            $updateData['available_slots'] = json_encode($slots ?: []);
        }

        if ($request->has('blocked_dates')) {
            $dates = is_array($request->blocked_dates) ? $request->blocked_dates : json_decode($request->blocked_dates, true);
            $updateData['blocked_dates'] = json_encode($dates ?: []);
        }

        DB::table('astrologers')->where('id', $id)->update($updateData);

        $updated = DB::table('astrologers')->where('id', $id)->first();
        $updated->available_slots = $this->parseJsonField($updated->available_slots);
        $updated->blocked_dates = $this->parseJsonField($updated->blocked_dates);

        return response()->json([
            'success' => true,
            'message' => "ஜோதிடர் ({$updated->name}) விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டது.",
            'astrologer' => $updated
        ]);
    }

    /**
     * Admin: Delete Astrologer
     */
    public function deleteAstrologer($id)
    {
        $astro = DB::table('astrologers')->where('id', $id)->first();
        if (!$astro) {
            return response()->json(['success' => false, 'message' => 'Astrologer not found'], 404);
        }

        DB::table('astrologers')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => "ஜோதிடர் ({$astro->name}) வெற்றிகரமாக நீக்கப்பட்டார்."
        ]);
    }

    /**
     * Admin: Toggle Astrologer Specific Date Availability (Free / Blocked)
     */
    public function toggleAstrologerAvailability(Request $request, $id)
    {
        $request->validate([
            'date' => 'required',
            'status' => 'required|string' // 'busy' / 'blocked' or 'available' / 'free'
        ]);

        $astro = DB::table('astrologers')->where('id', $id)->first();
        if (!$astro) {
            return response()->json(['success' => false, 'message' => 'Astrologer not found'], 404);
        }

        $date = date('Y-m-d', strtotime($request->date));
        $targetStatus = strtolower($request->status);
        $blockedDates = $this->parseJsonField($astro->blocked_dates) ?: [];

        if ($targetStatus === 'busy' || $targetStatus === 'blocked') {
            if (!in_array($date, $blockedDates)) {
                $blockedDates[] = $date;
            }
        } else {
            $blockedDates = array_values(array_filter($blockedDates, fn($d) => $d !== $date));
        }

        sort($blockedDates);

        DB::table('astrologers')->where('id', $id)->update([
            'blocked_dates' => json_encode($blockedDates),
            'updated_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => "தேதி ({$date}) " . ($targetStatus === 'busy' || $targetStatus === 'blocked' ? 'விடுப்பு நாளாக முடக்கப்பட்டது' : 'முன்பதிவுக்கு திறக்கப்பட்டது'),
            'blocked_dates' => $blockedDates
        ]);
    }

    /**
     * Admin: Update Available Consultation Timing Slots for Astrologer
     */
    public function updateAstrologerSlots(Request $request, $id)
    {
        $request->validate([
            'slots' => 'required|array'
        ]);

        $astro = DB::table('astrologers')->where('id', $id)->first();
        if (!$astro) {
            return response()->json(['success' => false, 'message' => 'Astrologer not found'], 404);
        }

        DB::table('astrologers')->where('id', $id)->update([
            'available_slots' => json_encode($request->slots),
            'updated_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'ஆலோசனை நேரப் பிரிவுகள் (Timing Slots) வெற்றிகரமாக சேமிக்கப்பட்டது.',
            'available_slots' => $request->slots
        ]);
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
            'chart_url' => 'nullable|string',
            'parigaram' => 'nullable|string',
            'parigaram_document' => 'nullable|string'
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
                'parigaram' => $request->parigaram ?? $booking->parigaram,
                'parigaram_document' => $request->parigaram_document ?? $booking->parigaram_document,
                'updated_at' => now()
            ]);

        $chartUrl = $request->chart_url ?? $booking->chart_url;

        // Auto notify user in mobile app
        if (!empty($booking->user_id)) {
            DB::table('notifications')->insert([
                'user_id'    => $booking->user_id,
                'title'      => 'ஜோதிட கணிப்பு நிறைவுற்றது! (Booking Completed)',
                'body'       => "உங்கள் முன்பதிவு (#{$id} - {$booking->service_type}) ஜோதிடரால் ஆய்வு செய்யப்பட்டு முடிவுற்றது. உங்கள் ஜாதகக் கோப்பு கீழே இணைக்கப்பட்டுள்ளது.",
                'type'       => 'booking_fulfilled',
                'data'       => json_encode(['booking_id' => $id, 'chart_url' => $chartUrl], JSON_UNESCAPED_SLASHES),
                'is_read'    => false,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

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
        $date = $request->input('date', date('Y-m-d'));
        $nallaNeram = $request->input('nalla_neram') ?? $request->input('nallaNeram') ?? $request->input('nallaneram') ?? '06:15 AM - 07:15 AM';

        DB::table('panchangams')->updateOrInsert(
            ['date' => $date],
            [
                'thithi' => (string) $request->input('thithi', ''),
                'star' => (string) $request->input('star', ''),
                'rahukalam' => (string) $request->input('rahukalam', ''),
                'yamagandam' => (string) $request->input('yamagandam', ''),
                'nalla_neram' => (string) $nallaNeram,
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
        $date = $request->input('date') ?? $request->input('prediction_date') ?? date('Y-m-d');
        $type = $request->input('type') ?? $request->input('tab_type') ?? 'daily';
        $predictions = $request->input('predictions') ?? [];

        try {
            foreach ($predictions as $p) {
                if (empty($p['rasi_name'])) continue;

                $existing = DB::table('rasi_palans')
                    ->where('prediction_date', $date)
                    ->where('rasi_name', $p['rasi_name'])
                    ->where('tab_type', $type)
                    ->first();

                if ($existing) {
                    DB::table('rasi_palans')->where('id', $existing->id)->update([
                        'prediction_text' => (string) ($p['prediction_text'] ?? ''),
                        'audio_url'       => $p['audio_url'] ?? null,
                        'video_url'       => $p['video_url'] ?? null,
                        'updated_at'      => now()
                    ]);
                } else {
                    DB::table('rasi_palans')->insert([
                        'prediction_date' => $date,
                        'rasi_name'       => $p['rasi_name'],
                        'tab_type'        => $type,
                        'prediction_text' => (string) ($p['prediction_text'] ?? ''),
                        'audio_url'       => $p['audio_url'] ?? null,
                        'video_url'       => $p['video_url'] ?? null,
                        'created_at'      => now(),
                        'updated_at'      => now()
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Rasi Palan predictions updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update predictions: ' . $e->getMessage()
            ], 500);
        }
    }
}
