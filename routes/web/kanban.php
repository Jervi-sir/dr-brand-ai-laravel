<?php

use App\Http\Controllers\Kanban\BoardController;
use App\Http\Controllers\Kanban\DeleteContentController;
use App\Http\Controllers\Kanban\IndexController;
use App\Http\Controllers\Kanban\RescheduleController;
use App\Http\Controllers\Kanban\RescheduleDateController;
use App\Http\Controllers\Kanban\ScriptsController;
use App\Http\Controllers\Kanban\UpdateContentController;
use App\Http\Controllers\Kanban\VoiceOverController;
use Illuminate\Support\Facades\Route;

Route::prefix('kanban')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', IndexController::class)->name('kanban.index');

    // API-style JSON routes
    Route::get('api/kanban', BoardController::class)->name('kanban.board');
    Route::get('api/content', ScriptsController::class)->name('kanban.scripts');
    Route::put('api/content/{id}', UpdateContentController::class)->name('kanban.content.update');
    Route::delete('api/content/{id}', DeleteContentController::class)->name('kanban.content.destroy');
    Route::post('api/voice-over', VoiceOverController::class)->name('kanban.voiceOver');
    Route::post('api/voice-over/reschedule', RescheduleController::class)->name('kanban.reschedule');
    Route::get('api/voice-over/reschedule-date', RescheduleDateController::class)->name('kanban.rescheduleDate');
});
