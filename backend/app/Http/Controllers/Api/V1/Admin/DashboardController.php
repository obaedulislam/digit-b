<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ApplicationStatus;
use App\Enums\InquiryStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\ApplicationResource;
use App\Http\Resources\Admin\InquiryResource;
use App\Models\Application;
use App\Models\ContactInquiry;
use App\Models\JobPosting;
use App\Models\MentorshipRequest;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $canApplications = $user->can('manage-applications');
        $canInquiries = $user->can('manage-inquiries');
        $canJobs = $user->can('manage-jobs');

        // Counts are only revealed to roles that may see the underlying data.
        $counts = [
            'new_applications' => $canApplications ? Application::query()->where('status', ApplicationStatus::New->value)->count() : null,
            'open_jobs' => $canJobs ? JobPosting::query()->open()->count() : null,
            'unread_inquiries' => $canInquiries ? ContactInquiry::query()->where('status', InquiryStatus::New->value)->count() : null,
            'subscribers' => $canInquiries ? NewsletterSubscriber::query()->whereNull('unsubscribed_at')->count() : null,
            'mentorship_requests' => $canInquiries ? MentorshipRequest::query()->where('status', InquiryStatus::New->value)->count() : null,
        ];

        return response()->json(['data' => [
            'counts' => $counts,
            'applications_series' => $canApplications ? $this->series() : [],
            'recent_applications' => $canApplications
                ? ApplicationResource::collection(Application::query()->with(['applicant', 'job'])->latest('id')->limit(5)->get())
                : [],
            'recent_inquiries' => $canInquiries
                ? InquiryResource::collection(ContactInquiry::query()->latest('id')->limit(5)->get())
                : [],
        ]]);
    }

    /** Applications per day for the last 14 days (zero-filled). */
    private function series(): array
    {
        $start = Carbon::today()->subDays(13);

        $rows = Application::query()
            ->where('created_at', '>=', $start)
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        return collect(range(0, 13))->map(function (int $i) use ($start, $rows) {
            $date = $start->copy()->addDays($i)->toDateString();

            return ['date' => $date, 'count' => (int) ($rows[$date] ?? 0)];
        })->all();
    }
}
