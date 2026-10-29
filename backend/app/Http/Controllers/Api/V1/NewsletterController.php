<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNewsletterRequest;
use App\Http\Requests\UnsubscribeNewsletterRequest;
use App\Mail\NewsletterWelcome;
use App\Models\NewsletterSubscriber;
use App\Services\Notifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    public function store(StoreNewsletterRequest $request, Notifier $notifier): JsonResponse
    {
        $subscriber = NewsletterSubscriber::query()->firstOrCreate(
            ['email' => $request->validated('email')],
            [
                'unsubscribe_token' => Str::random(64),
                'subscribed_at' => now(),
                'ip_address' => $request->ip(),
            ],
        );

        $created = $subscriber->wasRecentlyCreated;
        $resubscribed = false;

        // Someone who unsubscribed earlier can opt back in with the same call.
        if (! $created && $subscriber->unsubscribed_at !== null) {
            $subscriber->forceFill(['unsubscribed_at' => null, 'subscribed_at' => now()])->save();
            $resubscribed = true;
        }

        // Only new (or returning) subscribers get the welcome mail; repeat sign-ups of an
        // active address must not become a way to spam someone else's inbox.
        if ($created || $resubscribed) {
            $notifier->send($subscriber->email, new NewsletterWelcome($subscriber));
        }

        return response()->json(['data' => [
            'id' => $subscriber->id,
            'message' => $created ? 'You are subscribed. Welcome aboard!' : 'You are already subscribed. Thank you!',
        ]], $created ? 201 : 200);
    }

    /** One-click unsubscribe. The 64-char random token is the credential; unknown tokens are a 404. */
    public function unsubscribe(UnsubscribeNewsletterRequest $request): JsonResponse
    {
        $subscriber = NewsletterSubscriber::query()
            ->where('unsubscribe_token', $request->validated('token'))
            ->first();

        abort_if($subscriber === null, 404, 'This unsubscribe link is not valid.');

        // Idempotent: following the link twice keeps the first timestamp.
        if ($subscriber->unsubscribed_at === null) {
            $subscriber->forceFill(['unsubscribed_at' => now()])->save();
        }

        return response()->json(['data' => [
            'message' => 'You have been unsubscribed and will not receive further emails.',
        ]]);
    }
}
