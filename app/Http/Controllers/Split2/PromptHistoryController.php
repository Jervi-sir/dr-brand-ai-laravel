<?php

namespace App\Http\Controllers\Split2;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PromptHistoryController extends Controller
{
    public function __invoke(Request $request): \Illuminate\Http\JsonResponse
    {
        $history = DB::table('generated_split_history')
            ->where('user_id', $request->user()->id)
            ->where('is_deleted', false)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        // Map column names to JS camelCase
        $mapped = $history->map(function ($item) {
            return [
                'id' => $item->id,
                'prompt' => $item->prompt,
                'clientPersona' => $item->client_persona,
                'contentPillar' => $item->content_pillar,
                'subPillars' => json_decode($item->sub_pillars, true),
                'chosenSubPillars' => json_decode($item->chosen_sub_pillars, true),
                'hookType' => json_decode($item->hook_type, true),
                'scripts' => json_decode($item->scripts, true),
                'timestamp' => $item->created_at,
                'isDeleted' => $item->is_deleted,
            ];
        });

        return response()->json($mapped);
    }
}
