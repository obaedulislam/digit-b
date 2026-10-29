<x-mail::message>
# New application received

**{{ $applicant->full_name }}** applied for **{{ $jobTitle }}**.

<x-mail::table>
| | |
|:--|:--|
| E-mail | {{ $applicant->email }} |
| Phone | {{ $applicant->phone }} |
| Location | {{ $applicant->location }} |
| Current role | {{ $applicant->current_title }} |
| Experience | {{ $applicant->years_experience }} years |
| Work status | {{ $application->work_status->label() }} |
</x-mail::table>

<x-mail::button :url="$adminUrl">
Open in dashboard
</x-mail::button>
</x-mail::message>
