<?php

namespace App\Policies;

use App\Models\TelegramBot;
use App\Models\User;

class TelegramBotPolicy
{
    public function view(User $user, TelegramBot $telegramBot): bool
    {
        return $user->id === $telegramBot->user_id;
    }

    public function update(User $user, TelegramBot $telegramBot): bool
    {
        return $user->id === $telegramBot->user_id;
    }

    public function delete(User $user, TelegramBot $telegramBot): bool
    {
        return $user->id === $telegramBot->user_id;
    }
}
