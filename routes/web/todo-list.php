<?php

use App\Http\Controllers\TodoList\IndexController;
use App\Http\Controllers\TodoList\NextContentController;
use App\Http\Controllers\TodoList\RescheduleController;
use App\Http\Controllers\TodoList\RescheduleDateController;
use App\Http\Controllers\TodoList\ScriptsController;
use App\Http\Controllers\TodoList\TasksController;
use App\Http\Controllers\TodoList\VoiceOverController;
use Illuminate\Support\Facades\Route;

Route::prefix('todo-list')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', IndexController::class)->name('todoList.index');

    // API-style JSON routes
    Route::get('api/todo', TasksController::class)->name('todoList.tasks');
    Route::get('api/content', [ScriptsController::class, 'index'])->name('todoList.scripts');
    Route::get('api/content/next', NextContentController::class)->name('todoList.nextContent');
    Route::put('api/content/{id}', [ScriptsController::class, 'update'])->name('todoList.scripts.update');
    Route::delete('api/content/{id}', [ScriptsController::class, 'destroy'])->name('todoList.scripts.destroy');
    Route::post('api/voice-over', VoiceOverController::class)->name('todoList.voiceOver');
    Route::post('api/voice-over/reschedule', RescheduleController::class)->name('todoList.reschedule');
    Route::get('api/voice-over/reschedule-date', RescheduleDateController::class)->name('todoList.rescheduleDate');
});
