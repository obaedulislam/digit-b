<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Sent to the admin inbox when a new application arrives. */
class NewApplicationNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Application $application)
    {
        $this->afterCommit();
    }

    public function envelope(): Envelope
    {
        $name = $this->application->applicant->full_name;

        return new Envelope(subject: 'New application: '.$name.($this->application->job ? ' — '.$this->application->job->title : ''));
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.new-application', with: [
            'application' => $this->application,
            'applicant' => $this->application->applicant,
            'jobTitle' => $this->application->job?->title ?? 'General talent pool',
            'adminUrl' => config('digitb.frontend_url').'/admin/applications/'.$this->application->id,
        ]);
    }
}
