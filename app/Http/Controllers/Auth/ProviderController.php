<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\GoogleSetting;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class ProviderController extends Controller
{
    /**
     * Set dynamic config from DB before redirecting.
     */
    protected function setDynamicConfig(): void
    {
        $settings = GoogleSetting::first();
        if ($settings && $settings->is_active) {
            config([
                'services.google.client_id' => $settings->client_id,
                'services.google.client_secret' => $settings->client_secret,
                'services.google.redirect' => $settings->redirect_uri ?? config('services.google.redirect'),
            ]);
        }
    }

    public function redirect()
    {
        $this->setDynamicConfig();

        // Ensure socialite is re-instantiated with new config if needed
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        $this->setDynamicConfig();

        try {
            $googleUser = Socialite::driver('google')->user();

            $user = User::updateOrCreate([
                'email' => $googleUser->getEmail(),
            ], [
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'is_verified' => true,
            ]);

            Auth::login($user);

            return redirect('/chat');
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors(['email' => 'Unable to login with Google or account issues.']);
        }
    }
}
