<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/stock/move', [StockController::class, 'move']);
