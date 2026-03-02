<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Models\Content;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $from = $request->query('from');
        $to = $request->query('to');

        if ($from && $to) {
            $fromDate = Carbon::parse($from);
            $toDate = Carbon::parse($to);
        } else {
            $fromDate = Carbon::today();
            $toDate = Carbon::today()->addDays(6);
        }

        $tasks = Content::query()
            ->where('user_id', $request->user()->id)
            ->where(function ($query) use ($fromDate, $toDate) {
                $query->where(function ($q) use ($fromDate, $toDate) {
                    $q->whereIn('stage', ['voice_over', 'creation', 'done'])
                        ->where('deadline', '>=', $fromDate)
                        ->where('deadline', '<=', $toDate)
                        ->whereNotNull('deadline');
                })->orWhere('stage');
            })
            ->orderByRaw('CASE WHEN deadline IS NULL THEN 1 ELSE 0 END, deadline ASC')
            ->get();

        return response()->json($tasks);
    }
}
