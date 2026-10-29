<?php

namespace App\Services;

use Illuminate\Contracts\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Sends (or queues) mail without ever letting a mail failure break the request.
 */
class Notifier
{
    public function __construct(private SiteSettings $settings) {}

    /** The inbox that receives "new application / inquiry" alerts. */
    public function adminInbox(): ?string
    {
        return config('digitb.notification_email')
            ?: config('digitb.admin.email')
            ?: $this->settings->get('contact', 'email');
    }

    public function toAdmin(Mailable $mailable): void
    {
        if ($inbox = $this->adminInbox()) {
            $this->send($inbox, $mailable);
        }
    }

    public function send(string $to, Mailable $mailable): void
    {
        try {
            Mail::to($to)->send($mailable);
        } catch (Throwable $e) {
            // Never fail the user-facing request because of mail problems.
            Log::error('Mail delivery failed', [
                'mailable' => $mailable::class,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
