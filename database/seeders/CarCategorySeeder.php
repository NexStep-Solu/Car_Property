<?php

namespace Database\Seeders;

use App\Models\CarCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CarCategorySeeder extends Seeder
{
    /**
     * @var array<string, string> slug => name
     */
    protected array $categories = [
        'sedan' => 'Sedan',
        'suv' => 'SUV',
        'hatchback' => 'Hatchback',
        'pickup' => 'Pickup',
        'van' => 'Van',
        'coupe' => 'Coupe',
        'convertible' => 'Convertible',
        'wagon' => 'Wagon',
        'ev' => 'Electric Vehicle',
        'hybrid' => 'Hybrid',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->categories as $slug => $name) {
            // firstOrCreate (not updateOrCreate) so re-seeding never
            // rotates the stable uuid of an existing category.
            CarCategory::firstOrCreate(
                ['slug' => $slug],
                [
                    'uuid' => (string) Str::uuid(),
                    'name' => $name,
                    'description' => null,
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('Car categories seeded.');
    }
}
