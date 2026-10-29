<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingsRequest;
use App\Services\SiteSettings;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    public function show(SiteSettings $settings): JsonResponse
    {
        return response()->json(['data' => $settings->all()]);
    }

    public function update(SettingsRequest $request, SiteSettings $settings): JsonResponse
    {
        $settings->update($request->validated());

        return response()->json(['data' => $settings->all()]);
    }
}
