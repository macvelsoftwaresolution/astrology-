<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourierManagementController extends Controller
{
    /**
     * Get all physical book orders
     */
    public function getOrders()
    {
        $orders = DB::table('book_orders')
            ->join('users', 'book_orders.student_id', '=', 'users.id')
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
     * Update Courier Dispatch Status & AWB Tracking Number
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
