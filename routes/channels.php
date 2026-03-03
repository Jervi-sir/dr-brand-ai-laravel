<?php

use App\Models\Chat;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{id}', function ($user, $id) {
    $chat = Chat::find($id);

    return $chat && $user->id === $chat->user_id;
});

Broadcast::channel('split.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('split2.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
