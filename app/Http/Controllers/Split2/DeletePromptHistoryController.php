<?php

namespace App\Http\Controllers\Split2;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeletePromptHistoryController extends Controller
{
    public function __invoke(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        DB::table('generated_split_history')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->update(['is_deleted' => true]);

        return response()->json(null, 204);
    }
}
