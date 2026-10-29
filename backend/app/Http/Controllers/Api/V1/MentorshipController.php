<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\InquiryStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMentorshipRequestRequest;
use App\Http\Resources\MentorshipProgramResource;
use App\Mail\NewMentorshipRequestNotification;
use App\Models\MentorshipProgram;
use App\Models\MentorshipRequest;
use App\Services\Notifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MentorshipController extends Controller
{
    public function programs(): AnonymousResourceCollection
    {
        return MentorshipProgramResource::collection(MentorshipProgram::query()->published()->ordered()->get());
    }

    public function storeRequest(StoreMentorshipRequestRequest $request, Notifier $notifier): JsonResponse
    {
        $program = MentorshipProgram::query()->published()->where('slug', $request->validated('program'))->firstOrFail();

        $mentorshipRequest = MentorshipRequest::query()->create([
            ...$request->safe()->except(['program', 'consent']),
            'mentorship_program_id' => $program->id,
            'status' => InquiryStatus::New->value,
            'consented_at' => now(),
            'ip_address' => $request->ip(),
        ]);

        $mentorshipRequest->setRelation('program', $program);
        $notifier->toAdmin(new NewMentorshipRequestNotification($mentorshipRequest));

        return response()->json(['data' => [
            'id' => $mentorshipRequest->id,
            'message' => 'Thank you. A mentor coordinator will contact you shortly.',
        ]], 201);
    }
}
