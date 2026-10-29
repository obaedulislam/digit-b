<?php

use App\Http\Middleware\Honeypot;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api/v1',
        then: function () {
            // Crawler files: no session / cookies needed, so no middleware group.
            Route::group([], base_path('routes/seo.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Cookie-based SPA authentication (Sanctum) for the api group.
        $middleware->statefulApi();

        $middleware->alias([
            'honeypot' => Honeypot::class,
        ]);

        $middleware->append(SecurityHeaders::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $isJson = fn (Request $request): bool => $request->is('api/*', 'sanctum/*') || $request->expectsJson();

        $exceptions->shouldRenderJsonWhen($isJson);

        // Never leak model names / SQL in 404 messages.
        $notFound = fn (Throwable $e, Request $request) => $isJson($request)
            ? response()->json(['message' => 'Resource not found.'], 404)
            : null;
        $exceptions->render(fn (ModelNotFoundException $e, Request $request) => $notFound($e, $request));
        $exceptions->render(fn (NotFoundHttpException $e, Request $request) => $notFound($e, $request));

        $exceptions->render(fn (AuthenticationException $e, Request $request) => $isJson($request)
            ? response()->json(['message' => 'Unauthenticated.'], 401)
            : null);
    })->create();
