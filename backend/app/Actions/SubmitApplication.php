<?php

namespace App\Actions;

use App\Enums\ApplicationStatus;
use App\Mail\ApplicationAcknowledgement;
use App\Mail\NewApplicationNotification;
use App\Models\Applicant;
use App\Models\Application;
use App\Models\ApplicationEvent;
use App\Models\JobPosting;
use App\Services\Notifier;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class SubmitApplication
{
    public function __construct(private Notifier $notifier) {}

    /**
     * @param  array<string, mixed>  $data  validated request data
     */
    public function handle(array $data, UploadedFile $resume, ?string $ip = null): Application
    {
        $disk = Storage::disk(config('digitb.resume_disk'));
        $path = null;

        try {
            $application = DB::transaction(function () use ($data, $resume, $ip, $disk, &$path) {
                $job = filled($data['job'] ?? null)
                    ? JobPosting::query()->open()->where('slug', $data['job'])->firstOrFail()
                    : null;

                $applicant = Applicant::query()->updateOrCreate(
                    ['email' => mb_strtolower(trim($data['email']))],
                    [
                        'first_name' => $data['first_name'],
                        'last_name' => $data['last_name'],
                        'phone' => $data['phone'],
                        'location' => $data['location'],
                        'linkedin_url' => $data['linkedin_url'] ?? null,
                        'current_title' => $data['current_title'],
                        'current_company' => $data['current_company'] ?? null,
                        'years_experience' => $data['years_experience'],
                        'highest_education' => $data['highest_education'],
                        'skills' => $data['skills'] ?? null,
                    ],
                );

                $this->guardAgainstDuplicate($applicant, $job);

                // Random file name; the extension comes from the sniffed content type, not the client.
                $extension = $resume->guessExtension() ?: 'bin';
                $path = $disk->putFileAs(
                    'resumes/'.now()->format('Y/m'),
                    $resume,
                    Str::random(40).'.'.$extension,
                );

                $application = $applicant->applications()->create([
                    'job_posting_id' => $job?->id,
                    'status' => ApplicationStatus::New->value,
                    'work_status' => $data['work_status'],
                    'expected_salary' => $data['expected_salary'] ?? null,
                    'available_from' => $data['available_from'] ?? null,
                    'cover_letter' => $data['cover_letter'] ?? null,
                    'resume_path' => $path,
                    'resume_original_name' => Str::limit(basename($resume->getClientOriginalName()), 180, ''),
                    'resume_mime' => $resume->getMimeType(),
                    'resume_size' => $resume->getSize(),
                    'consented_at' => now(),
                    'ip_address' => $ip,
                ]);

                ApplicationEvent::query()->create([
                    'application_id' => $application->id,
                    'type' => ApplicationEvent::TYPE_CREATED,
                    'to_status' => ApplicationStatus::New->value,
                    'note' => 'Application submitted via website.',
                ]);

                return $application;
            });
        } catch (Throwable $e) {
            // The DB rolled back: do not leave an orphaned résumé behind.
            if ($path !== null) {
                $disk->delete($path);
            }

            throw $e;
        }

        $application->load(['applicant', 'job']);
        $this->notifier->send($application->applicant->email, new ApplicationAcknowledgement($application));
        $this->notifier->toAdmin(new NewApplicationNotification($application));

        return $application;
    }

    private function guardAgainstDuplicate(Applicant $applicant, ?JobPosting $job): void
    {
        $exists = Application::query()
            ->where('applicant_id', $applicant->id)
            ->where('job_posting_id', $job?->id)
            ->where('created_at', '>=', now()->subDays(config('digitb.duplicate_application_days', 30)))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'email' => ['You have already applied for this position recently. We will be in touch soon.'],
            ]);
        }
    }
}
