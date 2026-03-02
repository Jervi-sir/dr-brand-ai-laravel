<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Models\Content;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateContentController extends Controller
{
    public function __invoke(Request $request, string $id): JsonResponse
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

        if ($request->has('stage')) {
            $data['stage'] = $request->input('stage');

            if ($data['stage'] === 'script') {
                $data['deadline'] = null;
                $data['scheduled_date'] = null;
            }
        }

        $content->update($data);
        $content->refresh();

        return response()->json($content);
    }
}
