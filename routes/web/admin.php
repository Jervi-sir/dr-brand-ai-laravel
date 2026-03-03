<?php

use App\Http\Controllers\Admin\AiModelController;
use App\Http\Controllers\Admin\AiPromptHistoryController;
use App\Http\Controllers\Admin\AiUsageController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\ApiTokenController;
use App\Http\Controllers\Admin\GoogleSettingController;
use App\Http\Controllers\Admin\Split1ConfigController;
use App\Http\Controllers\Admin\Split2ConfigController;
use App\Http\Controllers\Admin\UnlockingCodeController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin'])->prefix('dr-admin')->name('admin.')->group(function () {
    Route::resource('api-tokens', ApiTokenController::class);
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/approve', [UserController::class, 'approve'])->name('users.approve');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::get('/ai-usage', [AiUsageController::class, 'index'])->name('ai-usage.index');

    Route::resource('ai-models', AiModelController::class);

    Route::get('/ai-prompt-history', [AiPromptHistoryController::class, 'index'])->name('ai-prompt-history.index');

    Route::resource('unlocking-codes', UnlockingCodeController::class);

    Route::get('/split-2-config', [Split2ConfigController::class, 'index'])->name('split-2-config.index');
    Route::post('/split-2-config', [Split2ConfigController::class, 'update'])->name('split-2-config.update');
    Route::get('/split-2-prompt-history', [Split2ConfigController::class, 'history'])->name('split-2-prompt-history.index');

    Route::get('/split-1-config', [Split1ConfigController::class, 'index'])->name('split-1-config.index');
    Route::post('/split-1-config', [Split1ConfigController::class, 'update'])->name('split-1-config.update');

    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

    Route::get('/google-settings', [GoogleSettingController::class, 'index'])->name('google-settings.index');
    Route::post('/google-settings', [GoogleSettingController::class, 'update'])->name('google-settings.update');
});
