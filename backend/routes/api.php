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
use App\Http\Controllers\FileUploadController;
use App\Http\Controllers\MatrimonyProfileController;
use App\Http\Controllers\SystemSettingsController;
use App\Http\Controllers\LmsCurriculumController;
use App\Http\Controllers\BatchController;
use App\Http\Middleware\CheckRole;

// =====================================================================
// PUBLIC ROUTES (No Auth Required)
// =====================================================================

// Unified File Upload (Images, PDFs, Audio, Video)
Route::post('/upload', [FileUploadController::class, 'upload']);

// Auth
Route::post('/auth/web-login',        [AuthController::class, 'webLogin']);
Route::post('/auth/mobile-login',     [AuthController::class, 'mobileLogin']);
Route::post('/auth/register',         [AuthController::class, 'register']);
Route::post('/auth/student-register',        [AuthController::class, 'studentRegister']);
Route::post('/auth/fetch-student-details',    [AuthController::class, 'fetchStudentDetails']);
Route::post('/auth/forgot-password',         [AuthController::class, 'forgotPassword']);

// Public Astrology Data
Route::get('/panchangam/today',     [AstrologyController::class, 'getTodayPanchangam']);
Route::get('/rasi-palan',           [JathagamController::class, 'getRasiPalan']);
Route::get('/availability',         [AstrologyController::class, 'getAvailability']);
Route::get('/public/astrologers',   [AstrologyController::class, 'getAstrologers']);
Route::get('/public/courses',       [CourseController::class, 'index']);
Route::get('/public/batches',       [BatchController::class, 'getPublicBatches']);
Route::get('/public/books',         [CourierManagementController::class, 'getPublicBooks']);
Route::get('/public/banners',       [SuperAdminController::class, 'getPublicBanners']);
Route::get('/public/seminars/{level?}',      [SuperAdminController::class, 'getPublicSeminars']);
Route::get('/public/materials/{level?}',     [SuperAdminController::class, 'getPublicMaterials']);
Route::get('/public/live-class/{level?}',    [SuperAdminController::class, 'getLiveClassInfo']);
Route::get('/public/exams/{level}', [\App\Http\Controllers\ExamController::class, 'getExams']);
Route::get('/rasi-icons',           [SystemSettingsController::class, 'getRasiIcons']);
Route::get('/settings/{key}',        [SystemSettingsController::class, 'getSetting']);

// Jathagam Public (no auth — para-jathagam & porutham matching work without login too)
Route::post('/jathagam/match',        [JathagamController::class, 'calculateMatch']);
Route::get('/jathagam/match/{id}',    [JathagamController::class, 'getMatch']);
Route::post('/jathagam/varan-search', [JathagamController::class, 'submitVaranSearch']);
Route::post('/jathagam/para-reading', [JathagamController::class, 'paraJathagamReading']);
Route::post('/matrimony-profiles',    [MatrimonyProfileController::class, 'store']);

// Booking & Payment (public — payment gateway does auth externally)
Route::post('/bookings/create',        [AstrologyController::class, 'createBooking']);
Route::post('/payments/create-order',  [AstrologyController::class, 'createRazorpayOrder']);
Route::post('/payments/verify',        [AstrologyController::class, 'verifyPayment']);

// Book Orders & Submissions (supports guest or authenticated user)
Route::post('/user/book-orders',       [CourierManagementController::class, 'createBookOrder']);
Route::post('/user/submissions',       [GradingController::class, 'submitExam']);

    // Jathagam Writing
    Route::post('/jathagam-writing/order', [\App\Http\Controllers\Api\JathagamWritingController::class, 'createOrder']);


// =====================================================================
// AUTHENTICATED USER ROUTES (Mobile — role:user)
// =====================================================================

Route::middleware('auth:sanctum')->group(function () {

    // Auth Info
    Route::get('/auth/me',     [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // User Profile CRUD
    Route::get('/user/profile',  [UserProfileController::class, 'getProfile']);
    Route::put('/user/profile',  [UserProfileController::class, 'updateProfile']);

    // My Jathagam — save & fetch own birth details
    Route::get('/user/jathagam',  [JathagamController::class, 'getMyJathagam']);
    Route::post('/user/jathagam', [JathagamController::class, 'saveMyJathagam']);

    // Past Marriage Match History
    Route::get('/jathagam/my-matches', [JathagamController::class, 'getMyMatches']);

    // Past Matrimony Registrations
    Route::get('/user/matrimony-profiles', [MatrimonyProfileController::class, 'userIndex']);

    // Appointment Booking History
    Route::get('/user/bookings', [UserProfileController::class, 'getMyBookings']);

    // Payment History
    Route::get('/user/payments', [UserProfileController::class, 'getPaymentHistory']);

    // Certificates & Submissions
    Route::get('/user/certificates', [GradingController::class, 'getMyCertificates']);

    // Notifications
    Route::get('/user/notifications',                    [NotificationController::class, 'getMyNotifications']);
    Route::put('/user/notifications/{id}/read',          [NotificationController::class, 'markRead']);
    Route::put('/user/notifications/read-all',           [NotificationController::class, 'markAllRead']);
    Route::delete('/user/notifications/{id}',            [NotificationController::class, 'deleteNotification']);
    Route::delete('/user/notifications',                 [NotificationController::class, 'clearAllNotifications']);
    Route::get('/user/notification-preferences',         [NotificationController::class, 'getNotificationPreferences']);
    Route::put('/user/notification-preferences',         [NotificationController::class, 'updateNotificationPreferences']);

    // My Book Orders
    Route::get('/user/book-orders',        [CourierManagementController::class, 'getMyBookOrders']);

    // LMS Student 60-Day Curriculum
    Route::get('/student/curriculum',                          [LmsCurriculumController::class, 'getStudentCurriculum']);
    Route::post('/student/curriculum/{curriculumId}/complete', [LmsCurriculumController::class, 'markDayComplete']);
});

// =====================================================================
// ADMIN ROUTES (Web Portal — role:admin)
// =====================================================================

Route::middleware(['auth:sanctum', CheckRole::class . ':admin'])->prefix('admin')->group(function () {

    // Platform Metrics & Team Management
    Route::get('/dashboard-metrics', [SuperAdminController::class, 'getDashboardMetrics']);
    Route::get('/team',              [SuperAdminController::class, 'listAdmins']);
    Route::post('/team',             [SuperAdminController::class, 'createAdmin']);
    Route::post('/create-admin',     [SuperAdminController::class, 'createAdmin']);
    Route::put('/team/{id}/toggle',  [SuperAdminController::class, 'toggleAdminStatus']);
    Route::delete('/team/{id}',      [SuperAdminController::class, 'deleteAdmin']);

    // LMS Courses & 60-Day Daily Learning Curriculum CRUD
    Route::get('/lms/batches',                      [LmsCurriculumController::class, 'getAdminBatches']);
    Route::post('/lms/batches',                     [LmsCurriculumController::class, 'createOrUpdateBatch']);
    Route::get('/lms/curriculum/{batchId}',         [LmsCurriculumController::class, 'getBatchCurriculum']);
    Route::post('/lms/curriculum',                  [LmsCurriculumController::class, 'saveDayCurriculum']);
    Route::post('/lms/curriculum/copy',             [LmsCurriculumController::class, 'copyBatchCurriculum']);
    Route::delete('/lms/curriculum/{id}',           [LmsCurriculumController::class, 'deleteDayCurriculum']);

    Route::get('/courses',                          [CourseController::class, 'index']);
    Route::post('/courses',                         [CourseController::class, 'store']);
    Route::put('/courses/{courseId}',               [CourseController::class, 'update']);
    Route::post('/courses/{courseId}/modules',      [CourseController::class, 'addModule']);
    Route::post('/modules/{moduleId}/lessons',      [CourseController::class, 'addLesson']);
    Route::delete('/courses/{id}',                  [CourseController::class, 'destroy']);

    // Exams & Quizzes
    Route::post('/exams',                           [App\Http\Controllers\ExamController::class, 'storeExam']);
    Route::put('/exams/{id}',                       [App\Http\Controllers\ExamController::class, 'updateExam']);
    Route::delete('/exams/{id}',                    [App\Http\Controllers\ExamController::class, 'destroyExam']);
    Route::post('/exams/{examId}/questions',        [App\Http\Controllers\ExamController::class, 'storeQuestion']);
    Route::delete('/questions/{id}',                [App\Http\Controllers\ExamController::class, 'destroyQuestion']);
    Route::post('/exams/{examId}/import-pdf',       [App\Http\Controllers\ExamController::class, 'importPdf']);

    // Student Exam Submissions & Certificates
    Route::get('/submissions',                      [GradingController::class, 'getSubmissions']);
    Route::post('/submissions/{id}/evaluate',       [GradingController::class, 'evaluateSubmission']);
    Route::get('/certificates',                     [GradingController::class, 'adminGetCertificates']);
    Route::post('/certificates',                    [GradingController::class, 'adminUploadCertificate']);
    Route::delete('/certificates/{id}',             [GradingController::class, 'adminDeleteCertificate']);

    // Book Orders & Courier
    Route::get('/book-orders',                      [CourierManagementController::class, 'getOrders']);
    Route::put('/book-orders/{id}/courier',         [CourierManagementController::class, 'updateCourierStatus']);
    
    // Books Inventory
    Route::get('/books',                            [CourierManagementController::class, 'getAdminBooks']);
    Route::post('/books',                           [CourierManagementController::class, 'saveBook']);
    Route::delete('/books/{id}',                    [CourierManagementController::class, 'deleteBook']);
    Route::get('/books/{id}/buyers',                [CourierManagementController::class, 'getBookBuyers']);

    // Astrology Appointment Bookings & Astrologer Availability
    Route::get('/bookings',                         [AstrologyController::class, 'getAdminBookings']);
    Route::put('/bookings/{id}/fulfill',            [AstrologyController::class, 'fulfillBooking']);
    Route::delete('/bookings/{id}',                 [AstrologyController::class, 'deleteBooking']);
    Route::get('/availability',                     [AstrologyController::class, 'getAdminAvailability']);
    Route::post('/availability/toggle',             [AstrologyController::class, 'toggleDateAvailability']);
    Route::delete('/availability/{id}',             [AstrologyController::class, 'deleteAvailability']);
    
    // Astrologers Management & Personal Availability
    Route::get('/astrologers',                                  [AstrologyController::class, 'getAstrologers']);
    Route::post('/astrologers',                                 [AstrologyController::class, 'createAstrologer']);
    Route::put('/astrologers/{id}',                             [AstrologyController::class, 'updateAstrologer']);
    Route::delete('/astrologers/{id}',                          [AstrologyController::class, 'deleteAstrologer']);
    Route::post('/astrologers/{id}/availability/toggle',        [AstrologyController::class, 'toggleAstrologerAvailability']);
    Route::put('/astrologers/{id}/slots',                       [AstrologyController::class, 'updateAstrologerSlots']);

    // Rasi Palan Management (CRUD for all 12 rasis)
    Route::put('/rasi-palan',                       [AstrologyController::class, 'updateRasiPalan']);
    Route::put('/panchangam',                       [AstrologyController::class, 'updatePanchangam']);
    Route::post('/rasi-icons',                      [SystemSettingsController::class, 'saveRasiIcons']);
    Route::post('/settings/{key}',                  [SystemSettingsController::class, 'saveSetting']);

    // Marriage Match Logs & Phone Consultation Updates
    Route::get('/marriage-matches',                 [JathagamController::class, 'adminGetMatches']);
    Route::put('/marriage-matches/{id}',            [JathagamController::class, 'adminUpdateMatch']);
    Route::delete('/marriage-matches/{id}',         [JathagamController::class, 'adminDeleteMatch']);

    // Matrimony Profiles (Registration)
    Route::get('/matrimony-profiles',               [MatrimonyProfileController::class, 'adminIndex']);
    Route::put('/matrimony-profiles/{id}/status',   [MatrimonyProfileController::class, 'adminUpdateStatus']);

    // User Profiles & Batches
    Route::get('/users',                            [UserProfileController::class, 'adminGetUsers']);
    Route::delete('/users/{id}',                    [UserProfileController::class, 'deleteUser']);
    Route::get('/batches',                          [BatchController::class, 'adminGetBatches']);
    Route::post('/batches',                         [BatchController::class, 'store']);
    Route::put('/batches/{id}',                     [BatchController::class, 'update']);
    Route::delete('/batches/{id}',                  [BatchController::class, 'destroy']);
    Route::put('/students/{id}/shift-batch',        [BatchController::class, 'shiftStudentBatch']);

    // Payment Transactions Ledger
    Route::get('/payment-transactions',             [UserProfileController::class, 'adminGetPayments']);

    // Notification Broadcast & Live Activity Alerts
    Route::get('/notifications/activity-alerts',                [NotificationController::class, 'getAdminActivityAlerts']);
    Route::post('/notifications/broadcast',                    [NotificationController::class, 'broadcastNotification']);
    Route::get('/notifications/broadcast-history',            [NotificationController::class, 'getBroadcastHistory']);
    Route::get('/notifications/daily-rasi-status',             [NotificationController::class, 'getDailyNotificationStatus']);
    Route::put('/notifications/daily-rasi-toggle',             [NotificationController::class, 'toggleDailyNotificationFeature']);

    // App Hero Banners CRUD
    Route::get('/banners',                                     [SuperAdminController::class, 'getAdminBanners']);
    Route::post('/banners',                                    [SuperAdminController::class, 'saveBanner']);
    Route::put('/banners/{id}',                                [SuperAdminController::class, 'saveBanner']);
    Route::delete('/banners/{id}',                             [SuperAdminController::class, 'deleteBanner']);

    // Live Seminars & Webinars CRUD
    Route::get('/seminars/{level?}',                           [SuperAdminController::class, 'getPublicSeminars']);
    Route::post('/seminars',                                   [SuperAdminController::class, 'saveSeminar']);
    Route::put('/seminars/{id}',                               [SuperAdminController::class, 'saveSeminar']);
    Route::delete('/seminars/{id}',                            [SuperAdminController::class, 'deleteSeminar']);

    // Live Class settings for Mobile Home Banner
    Route::get('/live-class/{level?}', [SuperAdminController::class, 'getLiveClassInfo']);
    Route::post('/live-class/{id?}', [SuperAdminController::class, 'saveLiveClassInfo']);
    Route::delete('/live-class/{id}', [SuperAdminController::class, 'deleteLiveClass']);

    // Course Study Materials / PDF Notes CRUD
    Route::get('/materials/{level?}',                          [SuperAdminController::class, 'getPublicMaterials']);
    Route::post('/materials',                                  [SuperAdminController::class, 'saveMaterial']);
    Route::put('/materials/{id}',                              [SuperAdminController::class, 'saveMaterial']);
    Route::delete('/materials/{id}',                           [SuperAdminController::class, 'deleteMaterial']);

    
        // Jathagam Writing Orders
        Route::get('/jathagam-writing-orders', [\App\Http\Controllers\Api\JathagamWritingController::class, 'getAdminOrders']);
});
