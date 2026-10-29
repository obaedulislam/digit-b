<?php

namespace App\Mail;

use App\Models\NewsletterSubscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Confirms a newsletter subscription and carries the one-click unsubscribe link. */
class NewsletterWelcome extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public NewsletterSubscriber $subscriber)
    {
        $this->afterCommit();
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'You are subscribed to DIGIT-B hiring insights');
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.newsletter-welcome', with: [
            'unsubscribeUrl' => $this->subscriber->unsubscribeUrl(),
        ]);
    }
}
