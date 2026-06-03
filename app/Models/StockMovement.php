<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'medicine_id',
        'inventory_stock_id',
        'supplier_id',
        'user_id',
        'reference_number',
        'movement_type',
        'quantity',
        'previous_quantity',
        'new_quantity',
        'unit_cost',
        'total_cost',
        'batch_number',
        'movement_date',
        'invoice_number',
        'challan_number',
        'reason',
        'notes',
    ];

    protected $casts = [
        'movement_date' => 'date',
        'quantity' => 'integer',
        'previous_quantity' => 'integer',
        'new_quantity' => 'integer',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
    ];

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function inventoryStock(): BelongsTo
    {
        return $this->belongsTo(InventoryStock::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function generateReferenceNumber(string $type): string
    {
        $prefix = match($type) {
            'purchase' => 'PO',
            'purchase_return' => 'PR',
            'sale' => 'SI',
            'sale_return' => 'SR',
            'adjustment' => 'SA',
            'transfer' => 'ST',
            'expired' => 'EX',
            'damaged' => 'DM',
            'recalled' => 'RC',
            'initial_stock' => 'IS',
            'damage_write_off' => 'WO',
            'theft' => 'TH',
            default => 'MV',
        };
        
        $lastMovement = self::where('movement_type', $type)
            ->orderBy('id', 'desc')
            ->first();
        
        $number = $lastMovement ? ((int) substr($lastMovement->reference_number, 2)) + 1 : 1;
        
        return $prefix . date('Ymd') . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    public static function getMovementTypes(): array
    {
        return [
            'purchase' => 'Purchase',
            'purchase_return' => 'Purchase Return',
            'sale' => 'Sale',
            'sale_return' => 'Sale Return',
            'adjustment' => 'Adjustment',
            'transfer' => 'Transfer',
            'expired' => 'Expired',
            'damaged' => 'Damaged',
            'recalled' => 'Recalled',
            'initial_stock' => 'Initial Stock',
            'damage_write_off' => 'Damage Write Off',
            'theft' => 'Theft/Loss',
        ];
    }
}
