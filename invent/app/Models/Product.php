<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    //
    protected $fillable = [
        'name',
        'sku',
        'category_id',
        'quantity',
        'price'
    ];
    
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    
    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }
    
}
