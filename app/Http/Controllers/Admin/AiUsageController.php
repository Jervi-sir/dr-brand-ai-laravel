<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AiUsageController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $date = $request->get('date');

        $usage = \App\Models\OpenAiApiUsage::query()
            ->with(['chat.user', 'model'])
            ->when($date, function ($query, $date) {
                return $query->whereDate('created_at', $date);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/ai-usage/index', [
            'usage' => $usage,
            'filters' => [
                'date' => $date,
            ],
        ]);
    }
}
