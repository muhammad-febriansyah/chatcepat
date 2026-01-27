<?php

namespace App\Policies;

use App\Models\User;
use App\Models\MetaBroadcast;

class MetaBroadcastPolicy
{
    /**
     * Determine if the user can view the broadcast.
     */
    public function view(User $user, MetaBroadcast $broadcast): bool
    {
        return $user->id === $broadcast->user_id;
    }

    /**
     * Determine if the user can create broadcasts.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the user can update the broadcast.
     */
    public function update(User $user, MetaBroadcast $broadcast): bool
    {
        return $user->id === $broadcast->user_id;
    }

    /**
     * Determine if the user can delete the broadcast.
     */
    public function delete(User $user, MetaBroadcast $broadcast): bool
    {
        return $user->id === $broadcast->user_id;
    }
}
