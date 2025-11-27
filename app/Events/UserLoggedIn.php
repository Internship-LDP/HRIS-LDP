<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserLoggedIn implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public User $user)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('super-admin.accounts'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'UserLoggedIn';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->user->id,
            'employee_code' => $this->user->employee_code,
            'name' => $this->user->name,
            'email' => $this->user->email,
            'role' => $this->user->role,
            'last_login_at' => optional($this->user->last_login_at)?->toDateTimeString(),
        ];
    }
}
