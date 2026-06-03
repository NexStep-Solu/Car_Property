<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Location;
use App\Models\Currency;
use Illuminate\Database\Seeder;

class BranchLocationCurrencySeeder extends Seeder
{
    public function run(): void
    {
        // Locations
        $location1 = Location::firstOrCreate(
            ['name' => 'New York'],
            ['description' => 'New York City Main Branch']
        );

        $location2 = Location::firstOrCreate(
            ['name' => 'Los Angeles'],
            ['description' => 'Los Angeles Branch']
        );

        $location3 = Location::firstOrCreate(
            ['name' => 'Chicago'],
            ['description' => 'Chicago Branch']
        );

        // Branches
        Branch::firstOrCreate(
            ['name' => 'Main Hospital'],
            [
                'location_id' => $location1->id,
            ]
        );

        Branch::firstOrCreate(
            ['name' => 'West Coast Medical Center'],
            [
                'location_id' => $location2->id,
            ]
        );

        Branch::firstOrCreate(
            ['name' => 'Midwest Healthcare Hub'],
            [
                'location_id' => $location3->id,
            ]
        );

        // Currencies
        Currency::firstOrCreate(
            ['code' => 'USD'],
            [
                'name' => 'US Dollar',
                'symbol' => '$',
                'rate' => 1.00,
            ]
        );

        Currency::firstOrCreate(
            ['code' => 'EUR'],
            [
                'name' => 'Euro',
                'symbol' => '€',
                'rate' => 0.92,
            ]
        );

        Currency::firstOrCreate(
            ['code' => 'GBP'],
            [
                'name' => 'British Pound',
                'symbol' => '£',
                'rate' => 0.79,
            ]
        );

        Currency::firstOrCreate(
            ['code' => 'JPY'],
            [
                'name' => 'Japanese Yen',
                'symbol' => '¥',
                'rate' => 149.50,
            ]
        );
    }
}
