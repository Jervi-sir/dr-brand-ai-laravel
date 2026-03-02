<?php

namespace App\Http\Controllers\Split;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SplitIndexController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('split/index', [
            'contentIdeas' => config('split.content_ideas', []),
            'hookTypes' => config('split.hook_types', []),
            'userId' => Auth::id(),
        ]);
    }
}
