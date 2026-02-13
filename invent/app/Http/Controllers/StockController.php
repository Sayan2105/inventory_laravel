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

        // dd(auth()->id());

        // Validate Karwayenge bc
        $request->validate([

            // So if someone selects a product only then can they enter stock movement so do we need product_id as without it it just cant happen
            // Also what is products,id is it id inside products or something else, does it always be in , sepperated?
            'product_id' => 'required | exists:products,id',

            // If we enter product_id shouldnt user_id be also there because it can just not happen without an user aswell, also add there exists:users,id?

            // what is in:in,out does it specify that can only be in/out or it means default is in?
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
                'product_id' => $product->id, // here we can also use the $request->product_id right as it is the same thing's id
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
