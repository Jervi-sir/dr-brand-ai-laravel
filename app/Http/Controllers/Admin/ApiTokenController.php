<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreApiTokenRequest;
use App\Http\Requests\Admin\UpdateApiTokenRequest;
use App\Models\ApiToken;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApiTokenController extends Controller
{
    public function index(Request $request): Response
    {
        $tokens = ApiToken::query()
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/api-tokens/index', [
            'tokens' => $tokens,
        ]);
    }

    public function store(StoreApiTokenRequest $request): RedirectResponse
    {
        ApiToken::create($request->validated());

        return redirect()->back()
            ->with('success', 'API Token created successfully.');
    }

    public function update(UpdateApiTokenRequest $request, ApiToken $api_token): RedirectResponse
    {
        $validated = $request->validated();
        if (empty($validated['token'])) {
            unset($validated['token']);
        }
        $api_token->update($validated);

        return redirect()->back()
            ->with('success', 'API Token updated successfully.');
    }

    public function destroy(ApiToken $api_token): RedirectResponse
    {
        $api_token->delete();

        return redirect()->back()
            ->with('success', 'API Token deleted successfully.');
    }
}
