<?php

use App\Http\Controllers\Split2\DeletePromptHistoryController;
use App\Http\Controllers\Split2\GenerateAutomaticScriptController;
use App\Http\Controllers\Split2\GenerateScriptsController;
use App\Http\Controllers\Split2\GenerateSubPillarsController;
use App\Http\Controllers\Split2\IndexController;
use App\Http\Controllers\Split2\PromptHistoryController;
use App\Http\Controllers\Split2\ValidateScriptController;
use Illuminate\Support\Facades\Route;

Route::prefix('split-2')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', IndexController::class)->name('script.generator');
    Route::post('generate-sub-pillars', GenerateSubPillarsController::class)->name('script.generateSubPillars');
    Route::post('generate-scripts', GenerateScriptsController::class)->name('script.generateScripts');
    Route::post('generate-automatic-scripts', GenerateAutomaticScriptController::class)->name('script.generateAutomaticScripts');
    Route::post('validate-script', ValidateScriptController::class)->name('script.validateScript');
    Route::get('prompt-history', PromptHistoryController::class)->name('script.promptHistory');
    Route::delete('prompt-history/{id}', DeletePromptHistoryController::class)->name('script.deletePromptHistory');
});
