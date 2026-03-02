<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexController extends Controller
{
    public function __invoke(): Response
    {
        $aiModels = \App\Models\AiModel::query()
            ->where('is_active', true)->get();

        return Inertia::render('chat/index', [
            'aiModels' => $aiModels,
        ]);
    }
}
