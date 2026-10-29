<?php

namespace App\Support;

/** Single definition of roles and permissions (seeders, tests and docs use this). */
class Access
{
    public const PERMISSIONS = [
        'manage-jobs',
        'manage-content',
        'manage-applications',
        'manage-inquiries',
        'manage-users',
        'manage-settings',
        'view-dashboard',
    ];

    /** @return array<string, list<string>> role => permissions */
    public static function roles(): array
    {
        return [
            'super-admin' => self::PERMISSIONS,
            'editor' => ['manage-content', 'view-dashboard'],
            'recruiter' => ['manage-jobs', 'manage-applications', 'manage-inquiries', 'view-dashboard'],
        ];
    }
}
