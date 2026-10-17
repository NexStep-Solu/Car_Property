<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Starter',
                'price_amount' => 30000,
                'currency' => 'MMK',
                'duration_days' => 30,
                'active_listing_limit' => 5,
                'featured_ads_limit' => 0,
                'features_json' => ['5 active listings', '30-day visibility', 'Basic support'],
                'sort_order' => 1,
            ],
            [
                'name' => 'Business',
                'price_amount' => 100000,
                'currency' => 'MMK',
                'duration_days' => 30,
                'active_listing_limit' => 20,
                'featured_ads_limit' => 3,
                'features_json' => ['20 active listings', '3 featured ads', '30-day visibility', 'Priority support'],
                'sort_order' => 2,
            ],
            [
                'name' => 'Premium',
                'price_amount' => 300000,
                'currency' => 'MMK',
                'duration_days' => 30,
                'active_listing_limit' => 100,
                'featured_ads_limit' => 10,
                'features_json' => ['100 active listings', '10 featured ads', '30-day visibility', 'Dedicated support', 'Homepage spotlight'],
                'sort_order' => 3,
            ],
        ];

        foreach ($packages as $package) {
            Package::updateOrCreate(
                ['slug' => Str::slug($package['name'])],
                [...$package, 'slug' => Str::slug($package['name']), 'is_active' => true]
            );
        }

        $this->command->info('Packages seeded (Starter, Business, Premium).');
    }
}
