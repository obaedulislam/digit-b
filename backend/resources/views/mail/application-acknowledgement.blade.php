<x-mail::message>
# Thank you, {{ $firstName }}

We have received your application{{ $jobTitle ? ' for **'.$jobTitle.'**' : '' }} and one of our recruiters will review it shortly.

**What happens next**

1. A recruiter reviews your profile and résumé.
2. If there is a match, we reach out to arrange a short introductory call.
3. We keep you informed about every step, whatever the outcome.

If you need to add anything to your application, simply reply to this e-mail.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
