<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;
// 🔥 CHANNEL UNTUK REALTIME LOGOUT
Broadcast::channel('user.{id}', function (User $user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('super-admin.accounts', function (User $user) {
    return $user->role === User::ROLES['super_admin'] || $user->isHumanCapitalAdmin();
});

Broadcast::channel('super-admin.letters', function (User $user) {
    return $user->role === User::ROLES['super_admin'] || $user->isHumanCapitalAdmin();
});
