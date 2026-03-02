<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSplit2ConfigRequest;
use App\Models\AiModel;
use App\Models\SplitPromptHistory;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class Split2ConfigController extends Controller
{
    public function index()
    {
        $models = AiModel::all();
        $currentConfig = SplitPromptHistory::where('is_current', true)->first();
        $history = SplitPromptHistory::with('ai_model')
            ->latest()
            ->get();

        return Inertia::render('admin/split-2-config/index', [
            'models' => $models,
            'currentConfig' => $currentConfig,
            'history' => $history,
        ]);
    }

    public function update(UpdateSplit2ConfigRequest $request)
    {
        SplitPromptHistory::where('is_current', true)->update(['is_current' => false]);

        SplitPromptHistory::create([
            'model_id' => $request->model_id,
            'prompt' => $request->prompt,
            'user_email' => Auth::user()->email,
            'is_current' => true,
        ]);

        return redirect()->back()->with('success', 'Split 2 configuration updated.');
    }

    public function history()
    {
        $history = SplitPromptHistory::with('ai_model')
            ->latest()
            ->paginate(15);

        return Inertia::render('admin/split-2-prompt-history/index', [
            'history' => $history,
        ]);
    }
}
