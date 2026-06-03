<?php

namespace Database\Seeders;

use App\Models\MedicineCategory;
use Illuminate\Database\Seeder;

class MedicineCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Antibiotics', 'code' => 'ANTIBIOTIC', 'description' => 'Anti-bacterial medications for treating infections'],
            ['name' => 'Analgesics', 'code' => 'ANALGESIC', 'description' => 'Pain relievers and fever reducers'],
            ['name' => 'Antipyretics', 'code' => 'ANTIPYRETIC', 'description' => 'Fever reducing medications'],
            ['name' => 'Anti-inflammatory', 'code' => 'ANTI-INFLAM', 'description' => 'Medications that reduce inflammation'],
            ['name' => 'Antihistamines', 'code' => 'ANTIHIST', 'description' => 'Allergy relief medications'],
            ['name' => 'Cardiovascular', 'code' => 'CARDIO', 'description' => 'Heart and blood pressure medications'],
            ['name' => 'Antidiabetics', 'code' => 'ANTIDIABETIC', 'description' => 'Blood sugar control medications'],
            ['name' => 'Antacids', 'code' => 'ANTACID', 'description' => 'Stomach acid reducers'],
            ['name' => 'Antivirals', 'code' => 'ANTIVIRAL', 'description' => 'Medications that fight viral infections'],
            ['name' => 'Antifungals', 'code' => 'ANTIFUNGAL', 'description' => 'Fungal infection treatments'],
            ['name' => 'Sedatives', 'code' => 'SEDATIVE', 'description' => 'Calming and sleep-inducing medications'],
            ['name' => 'Diuretics', 'code' => 'DIURETIC', 'description' => 'Water pills for fluid management'],
            ['name' => 'Bronchodilators', 'code' => 'BRONCHO', 'description' => 'Airway opening medications'],
            ['name' => 'Corticosteroids', 'code' => 'CORTICO', 'description' => 'Steroid medications for inflammation'],
            ['name' => 'Vitamins & Supplements', 'code' => 'VITAMIN', 'description' => 'Nutritional supplements'],
            ['name' => 'Vaccines', 'code' => 'VACCINE', 'description' => 'Immunization medications'],
            ['name' => 'Topical Preparations', 'code' => 'TOPICAL', 'description' => 'Skin and external use medications'],
            ['name' => 'Eye Drops', 'code' => 'EYEDROP', 'description' => 'Ophthalmic solutions'],
            ['name' => 'Respiratory', 'code' => 'RESPIRATORY', 'description' => 'Breathing and lung medications'],
            ['name' => 'Controlled Substances', 'code' => 'CONTROLLED', 'description' => 'Regulated medications requiring special handling'],
        ];

        foreach ($categories as $category) {
            MedicineCategory::firstOrCreate(
                ['code' => $category['code']],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'is_active' => true,
                ]
            );
        }
    }
}
