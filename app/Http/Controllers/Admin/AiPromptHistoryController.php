<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromptHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiPromptHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $history = PromptHistory::with('ai_model')
            ->when($request->input('search'), function ($query, $search) {
                $query->where('userEmail', 'like', "%{$search}%")
                    ->orWhere('prompt', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/ai-prompt-history/index', [
            'history' => $history,
            'filters' => $request->only(['search']),
        ]);
    }
}
