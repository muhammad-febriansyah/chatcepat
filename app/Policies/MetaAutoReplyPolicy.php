<?php

namespace App\Policies;

use App\Models\User;
use App\Models\MetaAutoReply;

class MetaAutoReplyPolicy
{
    /**
     * Determine if the user can view the auto reply.
     */
    public function view(User $user, MetaAutoReply $autoReply): bool
    {
        return $user->id === $autoReply->user_id;
    }

    /**
     * Determine if the user can create auto replies.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the user can update the auto reply.
     */
    public function update(User $user, MetaAutoReply $autoReply): bool
    {
        return $user->id === $autoReply->user_id;
    }

    /**
     * Determine if the user can delete the auto reply.
     */
    public function delete(User $user, MetaAutoReply $autoReply): bool
    {
        return $user->id === $autoReply->user_id;
    }
}
