<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class Split2ScriptsGenerated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function broadcastAs(): string
    {
        return 'Split2ScriptsGenerated';
    }

    public function __construct(
        public int $userId,
        public array $scripts,
        public int $historyId
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('split2.' . $this->userId),
        ];
    }
}
