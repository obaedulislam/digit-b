<?php

use App\Http\Controllers\ApiInfoController;
use Illuminate\Support\Facades\Route;

// API-only application: no views. `/sanctum/csrf-cookie` is registered by Sanctum.
Route::get('/', ApiInfoController::class);
