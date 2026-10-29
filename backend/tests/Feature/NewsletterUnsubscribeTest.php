<?php

namespace Tests\Feature;

use App\Mail\NewsletterWelcome;
use App\Models\NewsletterSubscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NewsletterUnsubscribeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    public function test_valid_token_unsubscribes_and_is_idempotent(): void
    {
        $subscriber = NewsletterSubscriber::factory()->create();

        $this->postJson('/api/v1/newsletter/unsubscribe', ['token' => $subscriber->unsubscribe_token])
            ->assertOk()
            ->assertJsonPath('data.message', 'You have been unsubscribed and will not receive further emails.');

        $first = $subscriber->fresh()->unsubscribed_at;
        $this->assertNotNull($first);

        $this->travel(2)->days();
        $this->postJson('/api/v1/newsletter/unsubscribe', ['token' => $subscriber->unsubscribe_token])->assertOk();

        $this->assertTrue($subscriber->fresh()->unsubscribed_at->equalTo($first), 'the first timestamp is kept');
    }

    public function test_unknown_token_is_a_404_without_revealing_anything(): void
    {
        // The global exception handler replaces 404 messages with a generic one on purpose
        // (no model names or internals leak), so clients key off the status code.
        $this->postJson('/api/v1/newsletter/unsubscribe', ['token' => str_repeat('a', 64)])
            ->assertNotFound()
            ->assertJsonStructure(['message']);
    }

    public function test_malformed_tokens_are_rejected_before_touching_the_database(): void
    {
        // Validation only: this loop sends more requests than the form limiter allows.
        $this->withoutMiddleware(ThrottleRequests::class);

        foreach ([null, '', 'short', str_repeat('a', 65), str_repeat('a', 63).'%', ['array']] as $token) {
            $this->postJson('/api/v1/newsletter/unsubscribe', ['token' => $token])
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['token']);
        }
    }

    public function test_unsubscribed_address_is_excluded_from_the_active_count_and_can_resubscribe(): void
    {
        $subscriber = NewsletterSubscriber::factory()->create(['email' => 'back@example.com']);
        $this->postJson('/api/v1/newsletter/unsubscribe', ['token' => $subscriber->unsubscribe_token])->assertOk();
        $this->assertSame(0, NewsletterSubscriber::query()->whereNull('unsubscribed_at')->count());

        $this->postJson('/api/v1/newsletter', ['email' => 'back@example.com'])->assertOk();

        $this->assertNull($subscriber->fresh()->unsubscribed_at);
        Mail::assertQueued(NewsletterWelcome::class, 1);
    }

    public function test_welcome_mail_goes_to_new_subscribers_with_a_working_unsubscribe_link(): void
    {
        $this->postJson('/api/v1/newsletter', ['email' => 'new@example.com'])->assertCreated();

        $subscriber = NewsletterSubscriber::query()->where('email', 'new@example.com')->firstOrFail();

        Mail::assertQueued(NewsletterWelcome::class, function (NewsletterWelcome $mail) use ($subscriber) {
            return $mail->hasTo('new@example.com')
                && str_contains($mail->content()->with['unsubscribeUrl'], '/unsubscribe?token='.$subscriber->unsubscribe_token);
        });
    }

    public function test_repeat_signups_of_an_active_address_do_not_send_more_mail(): void
    {
        $this->postJson('/api/v1/newsletter', ['email' => 'once@example.com'])->assertCreated();
        $this->postJson('/api/v1/newsletter', ['email' => 'once@example.com'])->assertOk();
        $this->postJson('/api/v1/newsletter', ['email' => 'ONCE@example.com'])->assertOk();

        Mail::assertQueued(NewsletterWelcome::class, 1);
    }

    public function test_honeypot_hits_send_no_mail(): void
    {
        $this->postJson('/api/v1/newsletter', ['email' => 'bot@example.com', 'website' => 'spam'])->assertCreated();

        Mail::assertNothingQueued();
        Mail::assertNothingSent();
    }

    public function test_unsubscribe_endpoint_is_rate_limited_like_the_other_forms(): void
    {
        $token = str_repeat('b', 64);
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/newsletter/unsubscribe', ['token' => $token])->assertNotFound();
        }

        $this->postJson('/api/v1/newsletter/unsubscribe', ['token' => $token])->assertTooManyRequests();
    }
}
