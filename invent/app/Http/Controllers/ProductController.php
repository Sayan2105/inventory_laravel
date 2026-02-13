<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return Product::with('category')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'sku' => 'required|unique:products,sku',
            'category_id' => 'required|exists:categories,id',
            'quantity' => 'required|integer|min:0'
        ]);

        $product = Product::create($request->all());

        return response()->json([
            'message' => 'Product created',
            'product' => $product
        ]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name' => 'required',
            'sku' => 'required|unique:products,sku,' . $product->id,
            'category_id' => 'required|exists:categories,id',
            'quantity' => 'required|integer|min:0'
        ]);

        $product->update($request->all());

        return response()->json([
            'message' => 'Product updated',
            'product' => $product
        ]);
    }
}
