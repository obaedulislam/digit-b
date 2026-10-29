<x-mail::message>
# You are subscribed

Thanks for subscribing. About once a month we send one concise email with retail supply chain technology hiring data, practical advice for hiring managers and candidates, and new roles.

No spam, and we never share your address. If this was not you, or you change your mind, you can unsubscribe at any time with one click:

<x-mail::button :url="$unsubscribeUrl" color="primary">
Unsubscribe
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
