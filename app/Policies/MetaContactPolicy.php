<?php

namespace App\Policies;

use App\Models\User;
use App\Models\MetaContact;

class MetaContactPolicy
{
    /**
     * Determine if the user can view the contact.
     */
    public function view(User $user, MetaContact $contact): bool
    {
        return $user->id === $contact->user_id;
    }

    /**
     * Determine if the user can create contacts.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the user can update the contact.
     */
    public function update(User $user, MetaContact $contact): bool
    {
        return $user->id === $contact->user_id;
    }

    /**
     * Determine if the user can delete the contact.
     */
    public function delete(User $user, MetaContact $contact): bool
    {
        return $user->id === $contact->user_id;
    }
}
