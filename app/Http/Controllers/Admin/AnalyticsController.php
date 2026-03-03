<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $userGrowthData = collect(range(5, 0))->map(function ($i) {
            $date = now()->subMonths($i);

            return [
                'month' => $date->format('M'),
                'users' => User::whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count(),
            ];
        })->values();

        $chatActivityData = collect(range(6, 0))->map(function ($i) {
            $date = now()->subDays($i);

            return [
                'day' => $date->format('D'),
                'messages' => Message::whereDate('created_at', $date->toDateString())
                    ->count(),
            ];
        })->values();

        return Inertia::render('admin/analytics/index', [
            'userGrowthData' => $userGrowthData,
            'chatActivityData' => $chatActivityData,
        ]);
    }
}
