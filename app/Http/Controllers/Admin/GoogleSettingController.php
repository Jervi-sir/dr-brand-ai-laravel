<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GoogleSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GoogleSettingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/google-settings/index', [
            'settings' => GoogleSetting::get(),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'client_id' => 'required|string',
            'client_secret' => 'required|string',
            'redirect_uri' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $settings = GoogleSetting::get();
        $settings->update($request->only('client_id', 'client_secret', 'redirect_uri', 'is_active'));

        return back()->with('message', 'Google settings updated successfully.');
    }
}
