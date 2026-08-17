<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AstrologyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\GradingController;
use App\Http\Controllers\CourierManagementController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\JathagamController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\NotificationController;
use App\Http\Middleware\CheckRole;

// =====================================================================
// PUBLIC ROUTES (No Auth Required)
// =====================================================================

// Auth
Route::post('/auth/web-login',        [AuthController::class, 'webLogin']);
Route::post('/auth/mobile-login',     [AuthController::class, 'mobileLogin']);
Route::post('/auth/register',         [AuthController::class, 'register']);
Route::post('/auth/forgot-password',  [AuthController::class, 'forgotPassword']);

// Public Astrology Data
Route::get('/panchangam/today', [AstrologyController::class, 'getTodayPanchangam']);
Route::get('/rasi-palan',       [JathagamController::class, 'getRasiPalan']);
Route::get('/availability',     [AstrologyController::class, 'getAvailability']);
Route::get('/public/courses',   [CourseController::class, 'index']);

// Jathagam Public (no auth — para-jathagam & porutham matching work without login too)
Route::post('/jathagam/match',        [JathagamController::class, 'calculateMatch']);
Route::post('/jathagam/varan-search', [JathagamController::class, 'submitVaranSearch']);
Route::post('/jathagam/para-reading', [JathagamController::class, 'paraJathagamReading']);

// Booking & Payment (public — payment gateway does auth externally)
Route::post('/bookings/create',        [AstrologyController::class, 'createBooking']);
Route::post('/payments/create-order',  [AstrologyController::class, 'createRazorpayOrder']);
Route::post('/payments/verify',        [AstrologyController::class, 'verifyPayment']);

// =====================================================================
// AUTHENTICATED USER ROUTES (Mobile — role:user)
// =====================================================================

Route::middleware('auth:sanctum')->group(function () {

    // Auth Info
    Route::get('/auth/me', [AuthController::class, 'me']);

    // User Profile CRUD
    Route::get('/user/profile',  [UserProfileController::class, 'getProfile']);
    Route::put('/user/profile',  [UserProfileController::class, 'updateProfile']);

    // My Jathagam — save & fetch own birth details
    Route::get('/user/jathagam',  [JathagamController::class, 'getMyJathagam']);
    Route::post('/user/jathagam', [JathagamController::class, 'saveMyJathagam']);

    // Past Marriage Match History
    Route::get('/jathagam/my-matches', [JathagamController::class, 'getMyMatches']);

    // Appointment Booking History
    Route::get('/user/bookings', [UserProfileController::class, 'getMyBookings']);

    // Payment History
    Route::get('/user/payments', [UserProfileController::class, 'getPaymentHistory']);

    // Notifications
    Route::get('/user/notifications',             [NotificationController::class, 'getMyNotifications']);
    Route::put('/user/notifications/{id}/read',   [NotificationController::class, 'markRead']);
    Route::put('/user/notifications/read-all',    [NotificationController::class, 'markAllRead']);
});

// =====================================================================
// ADMIN ROUTES (Web Portal — role:admin)
// =====================================================================

Route::middleware(['auth:sanctum', CheckRole::class . ':admin'])->prefix('admin')->group(function () {

    // Platform Metrics & Team Management
    Route::get('/dashboard-metrics', [SuperAdminController::class, 'getDashboardMetrics']);
    Route::get('/team',              [SuperAdminController::class, 'listAdmins']);
    Route::post('/team',             [SuperAdminController::class, 'createAdmin']);
    Route::put('/team/{id}/toggle',  [SuperAdminController::class, 'toggleAdminStatus']);

    // LMS Courses CRUD
    Route::get('/courses',                          [CourseController::class, 'index']);
    Route::post('/courses',                         [CourseController::class, 'store']);
    Route::post('/courses/{courseId}/modules',      [CourseController::class, 'addModule']);
    Route::post('/modules/{moduleId}/lessons',      [CourseController::class, 'addLesson']);
    Route::delete('/courses/{id}',                  [CourseController::class, 'destroy']);

    // Student Exam Submissions & Grading
    Route::get('/submissions',                      [GradingController::class, 'getSubmissions']);
    Route::post('/submissions/{id}/evaluate',       [GradingController::class, 'evaluateSubmission']);

    // Book Orders & Courier
    Route::get('/book-orders',                      [CourierManagementController::class, 'getOrders']);
    Route::put('/book-orders/{id}/courier',         [CourierManagementController::class, 'updateCourierStatus']);

    // Astrology Appointment Bookings & Astrologer Availability
    Route::get('/bookings',                         [AstrologyController::class, 'getAdminBookings']);
    Route::put('/bookings/{id}/fulfill',            [AstrologyController::class, 'fulfillBooking']);
    Route::delete('/bookings/{id}',                 [AstrologyController::class, 'deleteBooking']);
    Route::get('/availability',                     [AstrologyController::class, 'getAdminAvailability']);
    Route::post('/availability/toggle',             [AstrologyController::class, 'toggleDateAvailability']);
    Route::delete('/availability/{id}',             [AstrologyController::class, 'deleteAvailability']);

    // Rasi Palan Management (CRUD for all 12 rasis)
    Route::put('/rasi-palan',                       [AstrologyController::class, 'updateRasiPalan']);
    Route::put('/panchangam',                       [AstrologyController::class, 'updatePanchangam']);

    // Marriage Match Logs & Phone Consultation Updates
    Route::get('/marriage-matches',                 [JathagamController::class, 'adminGetMatches']);
    Route::put('/marriage-matches/{id}',            [JathagamController::class, 'adminUpdateMatch']);

    // User Profiles
    Route::get('/users',                            [UserProfileController::class, 'adminGetUsers']);

    // Payment Transactions Ledger
    Route::get('/payment-transactions',             [UserProfileController::class, 'adminGetPayments']);

    // Notification Broadcast
    Route::post('/notifications/broadcast',         [NotificationController::class, 'broadcastNotification']);
});
