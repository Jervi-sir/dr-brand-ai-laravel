<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AiModelController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $models = \App\Models\AiModel::query()
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/ai-models/index', [
            'models' => $models,
        ]);
    }

    public function store(\App\Http\Requests\Admin\StoreAiModelRequest $request): \Illuminate\Http\RedirectResponse
    {
        \App\Models\AiModel::create($request->validated());

        return redirect()->route('admin.ai-models.index')
            ->with('success', 'AI Model created successfully.');
    }

    public function update(\App\Http\Requests\Admin\UpdateAiModelRequest $request, \App\Models\AiModel $ai_model): \Illuminate\Http\RedirectResponse
    {
        $ai_model->update($request->validated());

        return redirect()->route('admin.ai-models.index')
            ->with('success', 'AI Model updated successfully.');
    }

    public function destroy(\App\Models\AiModel $ai_model): \Illuminate\Http\RedirectResponse
    {
        $ai_model->delete();

        return redirect()->route('admin.ai-models.index')
            ->with('success', 'AI Model deleted successfully.');
    }
}
