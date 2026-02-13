<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StockController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\MovementController;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);

    Route::get('/movements', [MovementController::class, 'index']);

    Route::post('/stock/move', [StockController::class, 'move']);
});



// Route::middleware('auth:sanctum')->post('/stock/move', [StockController::class, 'move']);
Route::post('/login',[AuthController::class,'login']);

