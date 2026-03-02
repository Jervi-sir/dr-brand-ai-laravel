<?php

namespace App\Http\Controllers\Split2;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class IndexController extends Controller
{
    public function __invoke(): \Inertia\Response
    {
        return Inertia::render('split2/index');
    }
}
