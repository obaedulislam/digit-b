<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

/** Tiny landing response for `/` so the API-only app has no view layer. */
class ApiInfoController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'name' => config('app.name'),
            'api' => url('/api/v1'),
            'docs' => 'See docs/02-api-contract.md',
        ]);
    }
}
