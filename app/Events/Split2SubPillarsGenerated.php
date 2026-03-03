<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class Split2SubPillarsGenerated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function broadcastAs(): string
    {
        return 'Split2SubPillarsGenerated';
    }

    public function __construct(
        public int $userId,
        public string $contentPillar,
        public string $clientPersona,
        public array $subPillars
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('split2.' . $this->userId),
        ];
    }
}
