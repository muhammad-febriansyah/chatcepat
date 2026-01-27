<?php

namespace App\Policies;

use App\Models\TelegramBroadcast;
use App\Models\User;

class TelegramBroadcastPolicy
{
    public function view(User $user, TelegramBroadcast $telegramBroadcast): bool
    {
        return $user->id === $telegramBroadcast->user_id;
    }

    public function update(User $user, TelegramBroadcast $telegramBroadcast): bool
    {
        return $user->id === $telegramBroadcast->user_id;
    }

    public function delete(User $user, TelegramBroadcast $telegramBroadcast): bool
    {
        return $user->id === $telegramBroadcast->user_id;
    }
}
