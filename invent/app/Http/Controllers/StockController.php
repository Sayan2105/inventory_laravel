<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use App\Models\StockMovement;

use Illuminate\Http\Request;

// What is the below use used for?
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{

    //
    public function move(Request $request){
        $request->validate([
            'product_id' => 'required | exists:products,id',
            'type' => 'required | in:in,out',
            'quantity' => 'required | integer | min:1',
        ]);

        return DB::transaction(function () use($request){
            $product = Product::findOrFail($request->product_id);
            $req_type = $request->type;

            // The stock should not be going to -ve
            if($req_type === 'out' && $product->quantity < $request->quantity){
                return response()->json([
                    'error' => 'Insufficient Stock'
                ]);
            }            

            // Make changes in the quantity table in the db directly from this below only?
            if($req_type === 'in'){
                $product->increment('quantity', $request->quantity);
            }else{
                $product->decrement('quantity', $request->quantity);
            }

            StockMovement::create([
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'type' => $req_type,
                'quantity' => $request->quantity,
                'note' => $request->note
            ]);

            return response()->json([
                'message' => 'Stock Updated Successfully',
                'current_stock' => $product->quantity
            ]);
        });
    }
}
