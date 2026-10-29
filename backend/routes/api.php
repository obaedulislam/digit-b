<?php

use App\Http\Controllers\Api\V1\Admin;
use App\Http\Controllers\Api\V1\ApplicationController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\FaqController;
use App\Http\Controllers\Api\V1\HomeController;
use App\Http\Controllers\Api\V1\JobController;
use App\Http\Controllers\Api\V1\MentorshipController;
use App\Http\Controllers\Api\V1\NewsletterController;
use App\Http\Controllers\Api\V1\PostController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\TestimonialController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1  (prefix /api/v1 is applied in bootstrap/app.php)
|--------------------------------------------------------------------------
| Contract: docs/02-api-contract.md
*/

// ---- Public, read-only (120 / min / IP) ------------------------------------
Route::middleware('throttle:api')->group(function () {
    Route::get('settings', SettingsController::class);
    Route::get('home', HomeController::class);

    Route::get('services', [ServiceController::class, 'index']);
    Route::get('services/{slug}', [ServiceController::class, 'show']);

    Route::get('jobs', [JobController::class, 'index']);
    Route::get('jobs/filters', [JobController::class, 'filters']);
    Route::get('jobs/{slug}', [JobController::class, 'show']);

    Route::get('posts', [PostController::class, 'index']);
    Route::get('posts/{slug}', [PostController::class, 'show']);
    Route::get('post-categories', [PostController::class, 'categories']);

    Route::get('mentorship/programs', [MentorshipController::class, 'programs']);
    Route::get('testimonials', [TestimonialController::class, 'index']);
    Route::get('faqs', [FaqController::class, 'index']);
});

// ---- Public form POSTs (5 / min / IP, honeypot) ----------------------------
Route::middleware(['throttle:forms', 'honeypot'])->group(function () {
    Route::post('applications', [ApplicationController::class, 'store']);
    Route::post('contact', [ContactController::class, 'store']);
    Route::post('newsletter', [NewsletterController::class, 'store']);
    Route::post('newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe']);
    Route::post('mentorship/requests', [MentorshipController::class, 'storeRequest']);
});

// ---- Auth ------------------------------------------------------------------
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

// ---- Admin (auth + 240 / min / user + per-permission gates) -----------------
Route::prefix('admin')->middleware(['auth:sanctum', 'throttle:admin'])->group(function () {
    Route::get('dashboard', Admin\DashboardController::class)->middleware('can:view-dashboard');

    Route::middleware('can:manage-jobs')->group(function () {
        Route::post('jobs/{job}/duplicate', [Admin\JobController::class, 'duplicate']);
        Route::apiResource('jobs', Admin\JobController::class);
    });

    // Authorization for applications is handled by ApplicationPolicy inside the controller
    // (plus the permission gate here as defence in depth).
    Route::middleware('can:manage-applications')->group(function () {
        Route::get('applications/export', [Admin\ApplicationController::class, 'export']);
        Route::get('applications/{application}/resume', [Admin\ApplicationController::class, 'resume']);
        Route::apiResource('applications', Admin\ApplicationController::class)->except(['store']);
    });

    Route::middleware('can:manage-inquiries')->group(function () {
        Route::apiResource('inquiries', Admin\InquiryController::class)->only(['index', 'show', 'update', 'destroy']);
        Route::apiResource('mentorship-requests', Admin\MentorshipRequestController::class)->only(['index', 'show', 'update', 'destroy']);
        Route::get('subscribers/export', [Admin\SubscriberController::class, 'export']);
        Route::apiResource('subscribers', Admin\SubscriberController::class)->only(['index', 'destroy']);
    });

    Route::middleware('can:manage-content')->group(function () {
        Route::apiResource('mentorship-programs', Admin\MentorshipProgramController::class);
        Route::apiResource('posts', Admin\PostController::class);
        Route::apiResource('post-categories', Admin\PostCategoryController::class);
        Route::apiResource('services', Admin\ServiceController::class);
        Route::apiResource('testimonials', Admin\TestimonialController::class);
        Route::apiResource('faqs', Admin\FaqController::class);
        Route::post('media', [Admin\MediaController::class, 'store']);
    });

    Route::middleware('can:manage-settings')->group(function () {
        Route::get('settings', [Admin\SettingsController::class, 'show']);
        Route::put('settings', [Admin\SettingsController::class, 'update']);
    });

    Route::middleware('can:manage-users')->group(function () {
        Route::get('roles', [Admin\UserController::class, 'roles']);
        Route::apiResource('users', Admin\UserController::class);
    });
});
