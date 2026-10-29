<?php

use App\Http\Controllers\SeoController;
use Illuminate\Support\Facades\Route;

// Crawler files, built from the DB + FRONTEND_URL. Registered without any
// middleware group (no session / cookies) in bootstrap/app.php.
Route::get('sitemap.xml', [SeoController::class, 'sitemap']);
Route::get('robots.txt', [SeoController::class, 'robots']);
