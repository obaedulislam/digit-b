<?php

namespace App\Models;

use Database\Factories\NewsletterSubscriberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterSubscriber extends Model
{
    /** @use HasFactory<NewsletterSubscriberFactory> */
    use HasFactory;

    protected $fillable = ['email', 'unsubscribe_token', 'subscribed_at', 'unsubscribed_at', 'ip_address'];

    protected $hidden = ['unsubscribe_token', 'ip_address'];

    /** Public one-click unsubscribe page (served by the SPA, which calls the API with the token). */
    public function unsubscribeUrl(): string
    {
        return config('digitb.frontend_url').'/unsubscribe?token='.$this->unsubscribe_token;
    }

    protected function casts(): array
    {
        return ['subscribed_at' => 'datetime', 'unsubscribed_at' => 'datetime'];
    }
}
