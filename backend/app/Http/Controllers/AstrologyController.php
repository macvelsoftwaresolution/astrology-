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
            // Seed a live initial row into DB so it's always in database
            $initialId = DB::table('panchangams')->insertGetId([
                'date' => $today,
                'thithi' => 'சுக்கில பட்ச துவாதசி (Dwadashi)',
                'star' => 'ரோகிணி (Rohini)',
                'rahukalam' => '10:30 AM - 12:00 PM',
                'yamagandam' => '09:15 AM - 10:15 AM',
                'nalla_neram' => '06:15 AM - 07:15 AM',
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $panchangam = DB::table('panchangams')->where('id', $initialId)->first();
        }

        return response()->json([
            'success' => true,
            'panchangam' => $panchangam,
            'date' => $panchangam->date,
            'thithi' => $panchangam->thithi,
            'star' => $panchangam->star,
            'rahukalam' => $panchangam->rahukalam,
            'yamagandam' => $panchangam->yamagandam,
            'nalla_neram' => $panchangam->nalla_neram ?? ''
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

        // Check for authenticated user token
        $userId = null;
        try {
            $bearerToken = $request->bearerToken();
            if ($bearerToken) {
                // Sanctum token format is id|token
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

        DB::table('bookings')->insert([
            'id' => $orderId,
            'user_name' => $request->user_name,
            'user_phone' => $request->user_phone,
            'user_id' => $userId,
            'service_type' => $request->service_type,
            'price' => $request->price,
            'status' => 'Pending',
            'details' => is_string($request->details) ? $request->details : json_encode($request->details, JSON_UNESCAPED_UNICODE),
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
