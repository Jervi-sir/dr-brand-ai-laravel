<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSplit1ConfigRequest;
use App\Models\AiModel;
use App\Models\Split1Config;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class Split1ConfigController extends Controller
{
    public function index(): Response
    {
        $models = AiModel::all();
        $currentConfig = Split1Config::where('is_active', true)->latest()->first();

        return Inertia::render('admin/split-1-config/index', [
            'models' => $models,
            'currentConfig' => $currentConfig,
        ]);
    }

    public function update(UpdateSplit1ConfigRequest $request): RedirectResponse
    {
        Split1Config::where('is_active', true)->update(['is_active' => false]);

        Split1Config::create([
            'model_id' => $request->model_id,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Split 1 configuration updated.');
    }
}
