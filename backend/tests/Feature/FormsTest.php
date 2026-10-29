<?php

namespace Tests\Feature;

use App\Mail\NewContactInquiryNotification;
use App\Mail\NewMentorshipRequestNotification;
use App\Models\ContactInquiry;
use App\Models\MentorshipProgram;
use App\Models\MentorshipRequest;
use App\Models\NewsletterSubscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class FormsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    private function contact(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Grace Hopper',
            'email' => 'grace@example.com',
            'phone' => '+1 555 010 1234',
            'company' => 'Navy',
            'inquiry_type' => 'hiring',
            'subject' => 'Place a job order',
            'message' => 'We need three backend engineers this quarter.',
            'consent' => true,
        ], $overrides);
    }

    public function test_contact_form_stores_inquiry_and_notifies_admin(): void
    {
        $this->postJson('/api/v1/contact', $this->contact())->assertCreated()->assertJsonStructure(['data' => ['id', 'message']]);

        $inquiry = ContactInquiry::query()->firstOrFail();
        $this->assertSame('new', $inquiry->status->value);
        $this->assertSame('hiring', $inquiry->inquiry_type->value);
        $this->assertNotNull($inquiry->consented_at);
        Mail::assertQueued(NewContactInquiryNotification::class, fn ($m) => $m->hasTo('inbox@digit-b.test'));
    }

    public function test_contact_form_validation(): void
    {
        $this->postJson('/api/v1/contact', [])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'inquiry_type', 'message', 'consent']);
        $this->postJson('/api/v1/contact', $this->contact(['message' => 'short', 'inquiry_type' => 'spam', 'email' => 'bad']))
            ->assertUnprocessable()->assertJsonValidationErrors(['message', 'inquiry_type', 'email']);
        $this->postJson('/api/v1/contact', $this->contact(['message' => str_repeat('a', 3001)]))->assertJsonValidationErrors(['message']);
    }

    public function test_contact_form_honeypot(): void
    {
        $this->postJson('/api/v1/contact', $this->contact(['website' => 'http://spam']))->assertCreated();

        $this->assertDatabaseCount('contact_inquiries', 0);
        Mail::assertNothingQueued();
    }

    public function test_newsletter_subscription_is_idempotent(): void
    {
        $this->postJson('/api/v1/newsletter', ['email' => 'Reader@Example.com'])->assertCreated();
        $this->postJson('/api/v1/newsletter', ['email' => 'reader@example.com'])->assertOk();

        $this->assertSame(1, NewsletterSubscriber::query()->count());
        $subscriber = NewsletterSubscriber::query()->first();
        $this->assertSame('reader@example.com', $subscriber->email);
        $this->assertSame(64, strlen($subscriber->unsubscribe_token));
    }

    public function test_newsletter_resubscribe_after_unsubscribe(): void
    {
        NewsletterSubscriber::factory()->create(['email' => 'back@example.com', 'unsubscribed_at' => now()]);

        $this->postJson('/api/v1/newsletter', ['email' => 'back@example.com'])->assertOk();

        $this->assertNull(NewsletterSubscriber::query()->first()->unsubscribed_at);
    }

    public function test_newsletter_validation_and_honeypot(): void
    {
        $this->postJson('/api/v1/newsletter', ['email' => 'nope'])->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->postJson('/api/v1/newsletter', ['email' => 'bot@example.com', 'website' => 'x'])->assertCreated();

        $this->assertDatabaseCount('newsletter_subscribers', 0);
    }

    public function test_mentorship_request_flow(): void
    {
        MentorshipProgram::factory()->create(['slug' => 'career-switch', 'name' => 'Career Switch']);
        MentorshipProgram::factory()->create(['slug' => 'hidden', 'is_published' => false]);

        $payload = ['program' => 'career-switch', 'name' => 'Sam', 'email' => 'sam@example.com', 'current_role' => 'Analyst',
            'goal' => 'I want to move into supply chain software.', 'consent' => true];

        $this->postJson('/api/v1/mentorship/requests', $payload)->assertCreated()->assertJsonStructure(['data' => ['id', 'message']]);

        $request = MentorshipRequest::query()->firstOrFail();
        $this->assertSame('Career Switch', $request->program->name);
        Mail::assertQueued(NewMentorshipRequestNotification::class);

        $this->postJson('/api/v1/mentorship/requests', ['program' => 'hidden'] + $payload)->assertUnprocessable()->assertJsonValidationErrors(['program']);
        $this->postJson('/api/v1/mentorship/requests', ['goal' => 'short'] + $payload)->assertUnprocessable()->assertJsonValidationErrors(['goal']);
    }
}
