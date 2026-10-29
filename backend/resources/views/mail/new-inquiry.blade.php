<x-mail::message>
# New {{ $inquiry->inquiry_type->value }} inquiry

**From:** {{ $inquiry->name }} &lt;{{ $inquiry->email }}&gt;
@if ($inquiry->phone)
**Phone:** {{ $inquiry->phone }}
@endif
@if ($inquiry->company)
**Company:** {{ $inquiry->company }}
@endif
@if ($inquiry->subject)
**Subject:** {{ $inquiry->subject }}
@endif

{{ $inquiry->message }}
</x-mail::message>
