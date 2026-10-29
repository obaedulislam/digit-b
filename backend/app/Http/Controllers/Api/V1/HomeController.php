<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\FaqGroup;
use App\Enums\ServiceGroup;
use App\Http\Controllers\Controller;
use App\Http\Resources\FaqResource;
use App\Http\Resources\JobSummaryResource;
use App\Http\Resources\MentorshipProgramResource;
use App\Http\Resources\PostSummaryResource;
use App\Http\Resources\ServiceResource;
use App\Http\Resources\TestimonialResource;
use App\Models\Faq;
use App\Models\JobPosting;
use App\Models\MentorshipProgram;
use App\Models\Post;
use App\Models\Service;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $featured = JobPosting::query()->open()->where('is_featured', true)->sortBy('newest')->limit(3)->get();
        if ($featured->count() < 3) {
            $fill = JobPosting::query()->open()->whereNotIn('id', $featured->modelKeys())
                ->sortBy('newest')->limit(3 - $featured->count())->get();
            $featured = $featured->concat($fill);
        }

        return response()->json(['data' => [
            'services' => ServiceResource::collection(
                Service::query()->published()->where('group', ServiceGroup::Solution->value)->ordered()->limit(6)->get()
            ),
            'featured_jobs' => JobSummaryResource::collection($featured),
            'testimonials' => TestimonialResource::collection(Testimonial::query()->published()->ordered()->get()),
            'mentorship_programs' => MentorshipProgramResource::collection(
                MentorshipProgram::query()->published()->ordered()->get()
            ),
            'latest_posts' => PostSummaryResource::collection(
                Post::query()->published()->with('category', 'author')->orderByDesc('published_at')->limit(3)->get()
            ),
            'faqs' => FaqResource::collection(
                Faq::query()->published()->where('group', FaqGroup::About->value)->ordered()->get()
            ),
        ]]);
    }
}
