<?php

namespace App\Mail;

use App\Models\MentorshipRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Sent to the admin inbox for every mentorship request. */
class NewMentorshipRequestNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public MentorshipRequest $mentorshipRequest)
    {
        $this->afterCommit();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            replyTo: [new Address($this->mentorshipRequest->email, $this->mentorshipRequest->name)],
            subject: 'New mentorship request: '.$this->mentorshipRequest->program->name,
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.new-mentorship-request', with: ['request' => $this->mentorshipRequest]);
    }
}
