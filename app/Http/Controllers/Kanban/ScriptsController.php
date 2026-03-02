<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Models\Content;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScriptsController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $page = (int) $request->query('page', '1');
        $limit = (int) $request->query('limit', '10');

        $query = Content::query()
            ->where('user_id', $request->user()->id)
            ->where('stage', 'script');

        $total = $query->count();

        $scripts = $query
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();

        return response()->json([
            'scripts' => $scripts,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }
}
