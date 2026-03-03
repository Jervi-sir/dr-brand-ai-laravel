<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class Split2ErrorReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function broadcastAs(): string
    {
        return 'Split2ErrorReceived';
    }

    public function __construct(
        public int $userId,
        public string $error,
        public string $type = 'general'
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('split2.' . $this->userId),
        ];
    }
}
