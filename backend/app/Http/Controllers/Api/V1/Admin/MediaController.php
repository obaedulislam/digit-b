<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MediaRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function store(MediaRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $disk = config('digitb.media_disk');

        // Random name + extension from the sniffed content type (never the client's file name).
        $path = Storage::disk($disk)->putFileAs(
            'uploads/'.now()->format('Y/m'),
            $file,
            Str::random(40).'.'.($file->guessExtension() ?: 'bin'),
            'public',
        );

        return response()->json(['data' => [
            'url' => '/storage/'.$path,
            'path' => $path,
        ]], 201);
    }
}
