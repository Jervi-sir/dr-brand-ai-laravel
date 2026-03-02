<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
require __DIR__.'/web/chat.php';
require __DIR__.'/web/split.php';
require __DIR__.'/web/split2.php';
require __DIR__.'/web/todo-list.php';
require __DIR__.'/web/kanban.php';
require __DIR__.'/web/calendar.php';
require __DIR__.'/web/admin.php';
