<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    public function manage(User $user): bool
    {
        return $user->can('manage-users');
    }

    public function delete(User $actor, User $target): Response
    {
        if (! $actor->can('manage-users')) {
            return Response::deny();
        }
        if ($actor->is($target)) {
            return Response::deny('You cannot delete your own account.');
        }
        if ($target->isSuperAdmin() && User::superAdminCount() <= 1) {
            return Response::deny('The last super-admin cannot be deleted.');
        }

        return Response::allow();
    }

    /**
     * @param  list<string>  $newRoles
     */
    public function changeRoles(User $actor, User $target, array $newRoles): Response
    {
        if (! $actor->can('manage-users')) {
            return Response::deny();
        }

        $demoting = $target->isSuperAdmin() && ! in_array(User::SUPER_ADMIN_ROLE, $newRoles, true);
        if (! $demoting) {
            return Response::allow();
        }
        if ($actor->is($target)) {
            return Response::deny('You cannot remove your own super-admin role.');
        }
        if (User::superAdminCount() <= 1) {
            return Response::deny('The last super-admin cannot be demoted.');
        }

        return Response::allow();
    }
}
