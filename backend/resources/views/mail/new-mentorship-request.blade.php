<x-mail::message>
# New mentorship request

**Programme:** {{ $request->program->name }}
**From:** {{ $request->name }} &lt;{{ $request->email }}&gt;
@if ($request->current_role)
**Current role:** {{ $request->current_role }}
@endif

**Goal**

{{ $request->goal }}
</x-mail::message>
