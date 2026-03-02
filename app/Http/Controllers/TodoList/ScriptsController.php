<?php

namespace App\Http\Controllers\TodoList;

use App\Http\Controllers\Controller;
use App\Models\Content;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScriptsController extends Controller
{
    public function index(Request $request): JsonResponse
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

    public function update(Request $request, string $id): JsonResponse
    {
        $content = Content::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $content) {
            return response()->json(['error' => 'Content not found or unauthorized'], 404);
        }

        $data = [];

        if ($request->has('generated_script')) {
            $data['generated_script'] = $request->input('generated_script');
        }

        if ($request->has('title')) {
            $data['title'] = $request->input('title');
        }

        if ($request->has('stage')) {
            $data['stage'] = $request->input('stage');

            if ($data['stage'] === 'script') {
                $data['deadline'] = null;
                $data['scheduled_date'] = null;
            }
        }

        if (! empty($data)) {
            $content->update($data);
            $content->refresh();
        }

        return response()->json($content);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $deleted = Content::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        if ($deleted === 0) {
            return response()->json(['error' => 'Content not found or unauthorized'], 404);
        }

        return response()->json(['message' => 'Content deleted']);
    }
}
