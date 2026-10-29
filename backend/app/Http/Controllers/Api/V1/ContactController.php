<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\InquiryStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Mail\NewContactInquiryNotification;
use App\Models\ContactInquiry;
use App\Services\Notifier;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function store(StoreContactRequest $request, Notifier $notifier): JsonResponse
    {
        $inquiry = ContactInquiry::query()->create([
            ...$request->safe()->except('consent'),
            'status' => InquiryStatus::New->value,
            'consented_at' => now(),
            'ip_address' => $request->ip(),
        ]);

        $notifier->toAdmin(new NewContactInquiryNotification($inquiry));

        return response()->json(['data' => [
            'id' => $inquiry->id,
            'message' => 'Thank you for getting in touch. We will reply within one business day.',
        ]], 201);
    }
}
