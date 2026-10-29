<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Bots fill the hidden `website` field. When it is non-empty we answer with a
 * convincing 201 but never reach the controller, so nothing is stored.
 */
class Honeypot
{
    public function handle(Request $request, Closure $next): Response
    {
        if (filled($request->input('website'))) {
            return response()->json([
                'data' => ['id' => 0, 'message' => 'Thank you. Your submission has been received.'],
            ], 201);
        }

        return $next($request);
    }
}
