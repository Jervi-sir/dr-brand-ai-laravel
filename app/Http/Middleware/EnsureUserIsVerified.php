<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->is_verified) {
            if ($request->is('unverified') || $request->is('api/auth/status') || $request->is('logout')) {
                return $next($request);
            }

            return redirect()->route('unverified');
        }

        if ($request->user() && $request->user()->is_verified && $request->is('unverified')) {
            return redirect()->route('home');
        }

        return $next($request);
    }
}
