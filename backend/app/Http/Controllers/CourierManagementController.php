<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourierManagementController extends Controller
{
    /**
     * Public: Get available books in the bookstore
     */
    public function getPublicBooks()
    {
        $books = [
            [
                'id' => 'book-1',
                'title' => 'ஜோதிட ரகசியங்கள் (Secrets of Astrology)',
                'author' => 'முனைவர் அருள்செல்வன்',
                'price' => 499.00,
                'cover_image' => 'assets/images/astro_service_bg.png',
                'description' => 'ஜோதிட அடிப்படைகள் மற்றும் நவகிரக ரகசியங்கள் அடங்கிய முழுமையான கையேடு.'
            ],
            [
                'id' => 'book-2',
                'title' => 'வாஸ்து சாஸ்திர முழு விளக்கம் (Complete Vastu Sastra)',
                'author' => 'சுவாமி நாகலிங்கம்',
                'price' => 599.00,
                'cover_image' => 'assets/images/temple_sunrise.png',
                'description' => 'வீடு, மனை, தொழிற்சாலை வாஸ்து அமைப்புகளை சுலபமாக கணக்கிட உதவும் நூல்.'
            ],
            [
                'id' => 'book-3',
                'title' => 'வேதங்கள் மற்றும் உபநிடதங்கள் (Vedas & Upanishads)',
                'author' => 'யோகி ஜெயராம்',
                'price' => 699.00,
                'cover_image' => 'assets/images/spiritual_education_bg.png',
                'description' => 'வேத ஆன்மீக தத்துவங்கள் மற்றும் ஆன்ம சாதனை வழிமுறைகள்.'
            ]
        ];

        return response()->json([
            'success' => true,
            'books' => $books
        ]);
    }

    /**
     * User: Place a new book purchase order with delivery address
     */
    public function createBookOrder(Request $request)
    {
        $request->validate([
            'book_title' => 'required|string',
            'price' => 'required|numeric',
            'shipping_address' => 'required|string',
            'phone' => 'required|string',
        ]);

        $user = $request->user();
        $studentId = $user ? $user->id : 1;
        $orderNumber = 'BOOK-ORD-' . date('Y') . '-' . strtoupper(\Illuminate\Support\Str::random(6));

        $orderId = DB::table('book_orders')->insertGetId([
            'order_number' => $orderNumber,
            'student_id' => $studentId,
            'book_title' => $request->book_title,
            'price' => $request->price,
            'shipping_address' => $request->shipping_address,
            'phone' => $request->phone,
            'status' => 'Processing',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Record in payment transactions
        DB::table('payment_transactions')->insert([
            'user_id' => $studentId,
            'booking_id' => $orderNumber,
            'order_type' => 'book_order',
            'razorpay_order_id' => 'order_' . \Illuminate\Support\Str::random(12),
            'razorpay_payment_id' => 'pay_' . \Illuminate\Support\Str::random(12),
            'amount' => $request->price,
            'currency' => 'INR',
            'status' => 'Paid',
            'description' => "Book Purchase: {$request->book_title}",
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Book order placed successfully.',
            'order_id' => $orderId,
            'order_number' => $orderNumber
        ]);
    }

    /**
     * Admin: Get all physical book orders
     */
    public function getOrders()
    {
        $orders = DB::table('book_orders')
            ->leftJoin('users', 'book_orders.student_id', '=', 'users.id')
            ->select(
                'book_orders.*',
                'users.name as student_name',
                'users.email as student_email'
            )
            ->orderBy('book_orders.created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders
        ]);
    }

    /**
     * Admin: Update Courier Dispatch Status & AWB Tracking Number
     */
    public function updateCourierStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Processing,Packed,Shipped,Delivered',
            'awb_number' => 'nullable|string',
            'courier_partner' => 'nullable|string',
        ]);

        DB::table('book_orders')->where('id', $id)->update([
            'status' => $request->status,
            'awb_number' => $request->awb_number,
            'courier_partner' => $request->courier_partner,
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Courier status updated successfully.'
        ]);
    }
}
