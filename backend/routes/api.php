<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AstrologyController;

// User routes (Mobile App)
Route::get('/panchangam/today', [AstrologyController::class, 'getTodayPanchangam']);
Route::get('/rasi-palan', [AstrologyController::class, 'getRasiPalan']);
Route::post('/bookings/create', [AstrologyController::class, 'createBooking']);
Route::post('/payments/create-order', [AstrologyController::class, 'createRazorpayOrder']);
Route::post('/payments/verify', [AstrologyController::class, 'verifyPayment']);

// Admin routes (Web Portal)
Route::prefix('admin')->group(function () {
    Route::get('/bookings', [AstrologyController::class, 'getAdminBookings']);
    Route::put('/bookings/{id}/fulfill', [AstrologyController::class, 'fulfillBooking']);
    Route::put('/panchangam', [AstrologyController::class, 'updatePanchangam']);
    Route::put('/rasi-palan', [AstrologyController::class, 'updateRasiPalan']);
});
