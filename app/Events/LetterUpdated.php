<?php

namespace App\Events;

use App\Models\Surat;
use App\Support\LetterPresenter;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LetterUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    private string $action;

    public function __construct(public Surat $surat, string $action)
    {
        $this->action = $action;
        $this->surat->loadMissing([
            'user:id,name,division,role',
            'departemen:id,nama,kode',
            'replyAuthor:id,name,division',
            'replyHistories.author:id,name,division',
            'disposer:id,name',
        ]);
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('super-admin.letters')];
    }

    public function broadcastAs(): string
    {
        return 'LetterUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'letter' => LetterPresenter::make($this->surat),
        ];
    }
}
