<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\User;

class ApplicationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('manage-applications');
    }

    public function view(User $user, Application $application): bool
    {
        return $user->can('manage-applications');
    }

    public function update(User $user, Application $application): bool
    {
        return $user->can('manage-applications');
    }

    public function delete(User $user, Application $application): bool
    {
        return $user->can('manage-applications');
    }

    /** Résumés contain personal data: only people who manage applications may download them. */
    public function downloadResume(User $user, Application $application): bool
    {
        return $user->can('manage-applications');
    }
}
