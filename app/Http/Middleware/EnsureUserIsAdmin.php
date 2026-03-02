<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle the incoming prompt.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->role && $request->user()->role->code === 'admin') {
            return $next($request);
        }

        abort(403);
    }
}
