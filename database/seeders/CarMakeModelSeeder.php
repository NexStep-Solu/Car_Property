<?php

namespace Database\Seeders;

use App\Models\CarMake;
use App\Models\CarModel;
use Illuminate\Database\Seeder;

class CarMakeModelSeeder extends Seeder
{
    /**
     * Popular makes with common models (Myanmar market focused).
     *
     * @var array<string, list<string>>
     */
    protected array $catalogue = [
        'Toyota' => ['Hilux', 'Land Cruiser', 'Corolla', 'Camry', 'Fortuner', 'Prius', 'RAV4', 'Hiace', 'Yaris', 'Vitz'],
        'Honda' => ['Civic', 'Accord', 'CR-V', 'Fit', 'Vezel', 'Odyssey', 'Freed'],
        'Nissan' => ['Navara', 'X-Trail', 'Note', 'Serena', 'Patrol', 'Sunny'],
        'Mazda' => ['CX-5', 'Atenza', 'Demio', 'Axela', 'CX-3'],
        'Mitsubishi' => ['Pajero', 'Outlander', 'Triton', 'Xpander', 'Mirage'],
        'Suzuki' => ['Swift', 'Ciaz', 'Ertiga', 'Carry', 'Alto'],
        'Ford' => ['Ranger', 'Everest', 'Escape'],
        'Chevrolet' => ['Colorado', 'Trailblazer', 'Spark'],
        'Hyundai' => ['Tucson', 'Santa Fe', 'Elantra', 'Accent', 'H-1'],
        'Kia' => ['Sportage', 'Sorento', 'Cerato', 'Picanto', 'Carnival'],
        'BMW' => ['3 Series', '5 Series', 'X1', 'X3', 'X5'],
        'Mercedes' => ['C-Class', 'E-Class', 'GLC', 'A-Class'],
        'Audi' => ['A4', 'A6', 'Q5', 'Q7'],
        'Volkswagen' => ['Tiguan', 'Polo', 'Passat'],
        'Lexus' => ['RX', 'NX', 'ES', 'LX'],
        'Subaru' => ['Forester', 'XV', 'Legacy', 'Impreza'],
        'Isuzu' => ['D-Max', 'MU-X', 'Forward'],
        'Land Rover' => ['Defender', 'Discovery', 'Range Rover'],
        'Jeep' => ['Wrangler', 'Cherokee', 'Compass'],
        'Tesla' => ['Model 3', 'Model Y', 'Model S'],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->catalogue as $makeName => $models) {
            $make = CarMake::firstOrCreate(
                ['name' => $makeName],
                ['name' => $makeName, 'is_active' => true]
            );

            foreach ($models as $modelName) {
                CarModel::firstOrCreate(
                    ['make_id' => $make->id, 'name' => $modelName],
                    ['make_id' => $make->id, 'name' => $modelName, 'is_active' => true]
                );
            }
        }

        $this->command->info('Car makes and models seeded.');
    }
}
