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
        $books = DB::table('books')->orderBy('created_at', 'desc')->get();

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

        $user = $request->user('sanctum') ?? $request->user();
        $studentId = $user ? $user->id : null;
        if (!$studentId) {
            $existing = DB::table('users')->where('phone', $request->phone)->first();
            if ($existing) {
                $studentId = $existing->id;
            } else {
                $studentId = DB::table('users')->insertGetId([
                    'name' => $request->name ?? 'Student Buyer',
                    'email' => 'buyer_' . time() . '_' . rand(100, 999) . '@astrology.com',
                    'phone' => $request->phone,
                    'password' => bcrypt('123456'),
                    'role' => 'user',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
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

        // Real notification for user & admin
        try {
            DB::table('notifications')->insert([
                'user_id'    => $studentId,
                'title'      => 'புத்தக ஆர்டர் பெறப்பட்டது (Book Order Placed)',
                'body'       => 'உங்கள் ' . $request->book_title . ' புத்தக ஆர்டர் #' . $orderNumber . ' பெறப்பட்டு தயாரிக்கப்படுகிறது.',
                'type'       => 'book_order',
                'is_read'    => false,
                'data'       => json_encode(['order_number' => $orderNumber]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $adminIds = DB::table('users')->where('role', 'admin')->pluck('id')->toArray();
            $adminNotifs = [];
            foreach ($adminIds as $aId) {
                $adminNotifs[] = [
                    'user_id'    => $aId,
                    'title'      => 'புதிய புத்தக ஆர்டர்! #' . $orderNumber,
                    'body'       => ($request->student_name ?: 'பயனர்') . ' என்பவர் ' . $request->book_title . ' புத்தகத்தை ஆர்டர் செய்துள்ளார்.',
                    'type'       => 'book_order',
                    'target_tab' => 'courier',
                    'is_read'    => false,
                    'data'       => json_encode(['order_number' => $orderNumber]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            if (!empty($adminNotifs)) {
                DB::table('notifications')->insert($adminNotifs);
            }
        } catch (\Throwable $e) {}

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
                'users.name as user_name',
                'users.email as student_email',
                'users.phone as user_phone'
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

        // Real notification to user
        $order = DB::table('book_orders')->where('id', $id)->first();
        if ($order && $order->student_id) {
            try {
                $statusMap = [
                    'Processing' => 'செயலாக்கத்தில் உள்ளது',
                    'Packed'     => 'பேக் செய்யப்பட்டது',
                    'Shipped'    => 'அனுப்பி வைக்கப்பட்டது',
                    'Delivered'  => 'விநியோகிக்கப்பட்டது',
                ];
                $statusTa = $statusMap[$request->status] ?? $request->status;

                DB::table('notifications')->insert([
                    'user_id'    => $order->student_id,
                    'title'      => 'புத்தக ஆர்டர் நிலை: ' . $statusTa,
                    'body'       => 'உங்கள் ' . $order->book_title . ' புத்தக ஆர்டர் #' . $order->order_number . ' நிலை: ' . $statusTa . ($request->awb_number ? ' (AWB: ' . $request->awb_number . ')' : ''),
                    'type'       => 'book_order',
                    'is_read'    => false,
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

    public function getAdminBooks()
    {
        $books = DB::table('books')->orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'books' => $books
        ]);
    }

    public function saveBook(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string',
                'author' => 'nullable|string',
                'price' => 'required|numeric',
                'description' => 'nullable|string',
            ]);

            $coverImagePath = null;
            if ($request->hasFile('cover_image')) {
                try {
                    $uploaded = cloudinary()->upload($request->file('cover_image')->getRealPath(), [
                        'folder' => 'astrology/books',
                        'resource_type' => 'image'
                    ]);
                    $coverImagePath = $uploaded->getSecurePath();
                } catch (\Throwable $e) {
                    $path = $request->file('cover_image')->store('books', 'public');
                    $coverImagePath = url('storage/' . $path);
                }
            } elseif (is_string($request->cover_image) && !empty($request->cover_image)) {
                $coverImagePath = $request->cover_image;
            }

            $bookImagesPaths = [];
            if ($request->hasFile('book_images')) {
                foreach ($request->file('book_images') as $file) {
                    try {
                        $uploaded = cloudinary()->upload($file->getRealPath(), [
                            'folder' => 'astrology/books/gallery',
                            'resource_type' => 'image'
                        ]);
                        $bookImagesPaths[] = $uploaded->getSecurePath();
                    } catch (\Throwable $e) {
                        $path = $file->store('books/images', 'public');
                        $bookImagesPaths[] = url('storage/' . $path);
                    }
                }
            } elseif (is_array($request->book_images)) {
                $bookImagesPaths = $request->book_images;
            }

            $data = [
                'title' => $request->title,
                'author' => $request->author ?? '',
                'price' => (float)$request->price,
                'description' => $request->description ?? '',
                'updated_at' => now(),
            ];

            if ($coverImagePath) {
                $data['cover_image'] = $coverImagePath;
            }

            if (\Illuminate\Support\Facades\Schema::hasColumn('books', 'book_images') && !empty($bookImagesPaths)) {
                $data['book_images'] = json_encode($bookImagesPaths);
            }

            if ($request->filled('id') || $request->id) {
                $bookId = $request->id;
                DB::table('books')->where('id', $bookId)->update($data);
                return response()->json([
                    'success' => true,
                    'message' => 'Book updated successfully',
                    'book' => DB::table('books')->find($bookId)
                ]);
            }

            $data['created_at'] = now();
            $id = DB::table('books')->insertGetId($data);

            return response()->json([
                'success' => true,
                'message' => 'Book added successfully',
                'book' => DB::table('books')->find($id)
            ]);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error: ' . implode(', ', array_map(fn($e) => implode(' ', $e), $ve->errors())),
                'errors' => $ve->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error saving book: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteBook($id)
    {
        DB::table('books')->where('id', $id)->delete();
        return response()->json([
            'success' => true,
            'message' => 'Book deleted successfully'
        ]);
    }

    public function getBookBuyers($id)
    {
        $book = DB::table('books')->find($id);
        if (!$book) return response()->json(['success' => false, 'message' => 'Book not found'], 404);

        $buyers = DB::table('book_orders')
            ->leftJoin('users', 'book_orders.student_id', '=', 'users.id')
            ->where('book_orders.book_title', $book->title)
            ->select('users.name', 'users.email', 'book_orders.phone', 'book_orders.order_number', 'book_orders.created_at', 'book_orders.status')
            ->get();

        return response()->json(['success' => true, 'buyers' => $buyers]);
    }

    public function getMyBookOrders(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        if (!$user) return response()->json(['success' => false, 'orders' => []], 401);

        $orders = DB::table('book_orders')
            ->where('student_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders
        ]);
    }
}
