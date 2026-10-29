<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Public frontend URL
    |--------------------------------------------------------------------------
    | Used for sitemap.xml / robots.txt and links inside e-mails.
    */
    'frontend_url' => rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/'),

    /*
    |--------------------------------------------------------------------------
    | Seeded super-admin
    |--------------------------------------------------------------------------
    | If ADMIN_PASSWORD is empty the seeder generates a random password and
    | prints it once to the console.
    */
    'admin' => [
        'name' => env('ADMIN_NAME', 'Site Administrator'),
        'email' => env('ADMIN_EMAIL'),
        'password' => env('ADMIN_PASSWORD'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification inbox
    |--------------------------------------------------------------------------
    | New applications / inquiries are announced here. Falls back to
    | ADMIN_EMAIL, then to the contact e-mail stored in site settings.
    */
    'notification_email' => env('NOTIFICATION_EMAIL'),

    /*
    |--------------------------------------------------------------------------
    | Storage
    |--------------------------------------------------------------------------
    */
    'resume_disk' => env('RESUME_DISK', 'private'),
    'media_disk' => env('MEDIA_DISK', 'public'),

    /*
    |--------------------------------------------------------------------------
    | Business rules
    |--------------------------------------------------------------------------
    */
    'duplicate_application_days' => 30,
    'resume_max_kb' => 5120,
    'media_max_kb' => 4096,
];
