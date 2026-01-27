<?php

namespace App\Policies;

use App\Models\TelegramAutoReply;
use App\Models\User;

class TelegramAutoReplyPolicy
{
    public function view(User $user, TelegramAutoReply $telegramAutoReply): bool
    {
        return $user->id === $telegramAutoReply->user_id;
    }

    public function update(User $user, TelegramAutoReply $telegramAutoReply): bool
    {
        return $user->id === $telegramAutoReply->user_id;
    }

    public function delete(User $user, TelegramAutoReply $telegramAutoReply): bool
    {
        return $user->id === $telegramAutoReply->user_id;
    }
}
