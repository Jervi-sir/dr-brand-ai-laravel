<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class IndexController extends Controller
{
    public function __invoke(): \Inertia\Response
    {
        return Inertia::render('calendar/index');
    }
}
