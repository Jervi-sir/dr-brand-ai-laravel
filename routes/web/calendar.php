<?php

use App\Http\Controllers\Calendar\DeleteEventController;
use App\Http\Controllers\Calendar\EventsController;
use App\Http\Controllers\Calendar\IndexController;
use App\Http\Controllers\Calendar\UpdateEventController;
use Illuminate\Support\Facades\Route;

Route::prefix('calendar')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', IndexController::class)->name('calendar.index');

    // API-style JSON routes
    Route::get('api/content', EventsController::class)->name('calendar.events');
    Route::patch('api/content/{id}', UpdateEventController::class)->name('calendar.events.update');
    Route::delete('api/content/{id}', DeleteEventController::class)->name('calendar.events.destroy');
});
