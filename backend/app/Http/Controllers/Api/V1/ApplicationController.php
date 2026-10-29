<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\SubmitApplication;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApplicationRequest;
use Illuminate\Http\JsonResponse;

class ApplicationController extends Controller
{
    public function store(StoreApplicationRequest $request, SubmitApplication $submit): JsonResponse
    {
        $application = $submit->handle($request->validated(), $request->file('resume'), $request->ip());

        return response()->json(['data' => [
            'id' => $application->id,
            'message' => 'Thank you. Your application has been received and a recruiter will be in touch.',
        ]], 201);
    }
}
