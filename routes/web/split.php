<?php

use App\Http\Controllers\Split\GenerateScriptsController;
use App\Http\Controllers\Split\SaveScriptController;
use App\Http\Controllers\Split\SplitIndexController;
use Illuminate\Support\Facades\Route;

Route::prefix('split')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', SplitIndexController::class)->name('split.index');
    Route::post('generate-scripts', GenerateScriptsController::class)->name('split.generateScripts');
    Route::post('save-script', SaveScriptController::class)->name('split.saveScript');
});
