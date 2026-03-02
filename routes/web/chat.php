<?php

use App\Http\Controllers\Chat\DestroyController;
use App\Http\Controllers\Chat\HistoryController;
use App\Http\Controllers\Chat\IndexController;
use App\Http\Controllers\Chat\SendFakeMessageController;
use App\Http\Controllers\Chat\SendMessageController;
use App\Http\Controllers\Chat\ShowController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('chat')->group(function () {
        Route::get('/', IndexController::class)->name('chat.index');
        Route::get('{chat}', ShowController::class)->name('chat.show');
        Route::post('send', SendMessageController::class)->name('chat.send');
        Route::post('send-fake', SendFakeMessageController::class)->name('chat.send-fake');
        Route::patch('{chat}', \App\Http\Controllers\Chat\UpdateController::class)->name('chat.update');
        Route::delete('{chat}', DestroyController::class)->name('chat.destroy');
    });
    Route::get('chat-history', HistoryController::class)->name('chat.history');
});
