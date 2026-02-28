<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StockController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\MovementController;
use App\Http\Controllers\CategoryController;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/movements', [MovementController::class, 'index']);

    Route::post('/stock/move', [StockController::class, 'move'])
    ->middleware('role:admin,manager,staff');

    Route::get('/products', [ProductController::class, 'index'])
    ->middleware('role:admin,manager,staff');

    Route::post('/products', [ProductController::class, 'store'])
        ->middleware('role:admin,manager');

    Route::put('/products/{id}', [ProductController::class, 'update'])
        ->middleware('role:admin,manager');

    Route::delete('/products/{id}', [ProductController::class, 'destroy'])
        ->middleware('role:admin');

    Route::get('/categories', [CategoryController::class, 'index'])
        ->middleware('role:admin,manager,staff');
    
    Route::post('/categories', [CategoryController::class, 'store'])
        ->middleware('role:admin,manager');
    
    Route::put('/categories/{id}', [CategoryController::class, 'update'])
        ->middleware('role:admin,manager');
    
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])
        ->middleware('role:admin');

});

// Route::middleware('auth:sanctum')->post('/stock/move', [StockController::class, 'move']);
Route::post('/login',[AuthController::class,'login']);

