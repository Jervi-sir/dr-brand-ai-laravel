<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnlockingCodeController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $codes = \App\Models\Code::query()
            ->with(['usages.user'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/unlocking-codes/index', [
            'codes' => $codes,
        ]);
    }

    public function store(\App\Http\Requests\Admin\StoreCodeRequest $request): \Illuminate\Http\RedirectResponse
    {
        \App\Models\Code::create($request->validated());

        return redirect()->route('admin.unlocking-codes.index')
            ->with('success', 'Code created successfully.');
    }

    public function update(\App\Http\Requests\Admin\UpdateCodeRequest $request, \App\Models\Code $unlocking_code): \Illuminate\Http\RedirectResponse
    {
        $unlocking_code->update($request->validated());

        return redirect()->route('admin.unlocking-codes.index')
            ->with('success', 'Code updated successfully.');
    }

    public function destroy(\App\Models\Code $unlocking_code): \Illuminate\Http\RedirectResponse
    {
        $unlocking_code->delete();

        return redirect()->route('admin.unlocking-codes.index')
            ->with('success', 'Code deleted successfully.');
    }
}
