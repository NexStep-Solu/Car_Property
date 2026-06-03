<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'medicine_code',
        'name',
        'generic_name',
        'brand_name',
        'category_id',
        'dosage_form',
        'strength',
        'unit',
        'manufacturer',
        'country_of_origin',
        'sku',
        'barcode',
        'rack_location',
        'cost_price',
        'selling_price',
        'wholesale_price',
        'reorder_level',
        'minimum_stock',
        'maximum_stock',
        'requires_prescription',
        'is_controlled',
        'is_active',
        'is_vaccine',
        'side_effects',
        'contraindications',
        'storage_instructions',
        'description',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'reorder_level' => 'integer',
        'minimum_stock' => 'integer',
        'maximum_stock' => 'integer',
        'requires_prescription' => 'boolean',
        'is_controlled' => 'boolean',
        'is_active' => 'boolean',
        'is_vaccine' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(MedicineCategory::class, 'category_id');
    }

    public function inventoryStocks(): HasMany
    {
        return $this->hasMany(InventoryStock::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function purchaseOrderItems(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function getTotalStockAttribute(): int
    {
        return $this->inventoryStocks()
            ->where('status', 'available')
            ->sum('quantity');
    }

    public function getAvailableStockAttribute(): int
    {
        return $this->inventoryStocks()
            ->where('status', 'available')
            ->sum('quantity') - $this->inventoryStocks()
            ->where('status', 'available')
            ->sum('reserved_quantity');
    }

    public static function generateCode(): string
    {
        $lastMedicine = self::orderBy('id', 'desc')->first();
        $number = $lastMedicine ? ((int) substr($lastMedicine->medicine_code, 3)) + 1 : 1;
        return 'MED' . str_pad($number, 5, '0', STR_PAD_LEFT);
    }
}
