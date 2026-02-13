<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;

class MovementController extends Controller
{
    public function index()
    {
        return StockMovement::with(['product','user'])
            ->latest()
            ->get();
    }
}
