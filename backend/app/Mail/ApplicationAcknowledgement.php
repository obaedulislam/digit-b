<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Sent to the candidate after a successful application. */
class ApplicationAcknowledgement extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Application $application)
    {
        $this->afterCommit();
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'We received your application to DIGIT-B');
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.application-acknowledgement', with: [
            'firstName' => $this->application->applicant->first_name,
            'jobTitle' => $this->application->job?->title,
        ]);
    }
}
