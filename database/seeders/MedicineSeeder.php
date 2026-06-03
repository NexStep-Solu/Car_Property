<?php

namespace Database\Seeders;

use App\Models\Medicine;
use App\Models\MedicineCategory;
use Illuminate\Database\Seeder;

class MedicineSeeder extends Seeder
{
    public function run(): void
    {
        $categories = MedicineCategory::all()->keyBy('code');

        if ($categories->isEmpty()) {
            $this->command->info('Please run MedicineCategorySeeder first');
            return;
        }

        $medicines = [
            // Antibiotics
            ['name' => 'Amoxicillin 500mg', 'generic_name' => 'Amoxicillin', 'brand_name' => 'Amoxil', 'category_id' => $categories['ANTIBIOTIC']->id ?? null, 'dosage_form' => 'Capsule', 'strength' => '500mg', 'unit' => 'piece', 'manufacturer' => 'Pfizer', 'cost_price' => 0.15, 'selling_price' => 0.50, 'reorder_level' => 500, 'minimum_stock' => 100, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Azithromycin 250mg', 'generic_name' => 'Azithromycin', 'brand_name' => 'Zithromax', 'category_id' => $categories['ANTIBIOTIC']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '250mg', 'unit' => 'piece', 'manufacturer' => 'Pfizer', 'cost_price' => 0.80, 'selling_price' => 2.50, 'reorder_level' => 200, 'minimum_stock' => 50, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Ciprofloxacin 500mg', 'generic_name' => 'Ciprofloxacin', 'brand_name' => 'Cipro', 'category_id' => $categories['ANTIBIOTIC']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '500mg', 'unit' => 'piece', 'manufacturer' => 'Bayer', 'cost_price' => 0.25, 'selling_price' => 0.85, 'reorder_level' => 300, 'minimum_stock' => 75, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Metronidazole 400mg', 'generic_name' => 'Metronidazole', 'brand_name' => 'Flagyl', 'category_id' => $categories['ANTIBIOTIC']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '400mg', 'unit' => 'piece', 'manufacturer' => 'Sanofi', 'cost_price' => 0.10, 'selling_price' => 0.35, 'reorder_level' => 400, 'minimum_stock' => 100, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Ceftriaxone 1g Injection', 'generic_name' => 'Ceftriaxone', 'brand_name' => 'Rocephin', 'category_id' => $categories['ANTIBIOTIC']->id ?? null, 'dosage_form' => 'Injection', 'strength' => '1g', 'unit' => 'vial', 'manufacturer' => 'Roche', 'cost_price' => 5.50, 'selling_price' => 12.00, 'reorder_level' => 100, 'minimum_stock' => 25, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],

            // Analgesics
            ['name' => 'Paracetamol 500mg', 'generic_name' => 'Paracetamol', 'brand_name' => 'Tylenol', 'category_id' => $categories['ANALGESIC']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '500mg', 'unit' => 'piece', 'manufacturer' => 'Johnson & Johnson', 'cost_price' => 0.02, 'selling_price' => 0.10, 'reorder_level' => 1000, 'minimum_stock' => 500, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Ibuprofen 400mg', 'generic_name' => 'Ibuprofen', 'brand_name' => 'Advil', 'category_id' => $categories['ANALGESIC']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '400mg', 'unit' => 'piece', 'manufacturer' => 'Pfizer', 'cost_price' => 0.05, 'selling_price' => 0.20, 'reorder_level' => 800, 'minimum_stock' => 200, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Tramadol 50mg', 'generic_name' => 'Tramadol', 'brand_name' => 'Ultram', 'category_id' => $categories['ANALGESIC']->id ?? null, 'dosage_form' => 'Capsule', 'strength' => '50mg', 'unit' => 'piece', 'manufacturer' => 'Janssen', 'cost_price' => 0.15, 'selling_price' => 0.60, 'reorder_level' => 300, 'minimum_stock' => 100, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => true],
            ['name' => 'Diclofenac 50mg', 'generic_name' => 'Diclofenac', 'brand_name' => 'Voltaren', 'category_id' => $categories['ANALGESIC']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '50mg', 'unit' => 'piece', 'manufacturer' => 'Novartis', 'cost_price' => 0.08, 'selling_price' => 0.35, 'reorder_level' => 500, 'minimum_stock' => 150, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Morphine Sulfate 10mg', 'generic_name' => 'Morphine', 'brand_name' => 'MS Contin', 'category_id' => $categories['ANALGESIC']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '10mg', 'unit' => 'piece', 'manufacturer' => 'Purdue Pharma', 'cost_price' => 0.50, 'selling_price' => 1.50, 'reorder_level' => 100, 'minimum_stock' => 25, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => true],

            // Cardiovascular
            ['name' => 'Amlodipine 5mg', 'generic_name' => 'Amlodipine', 'brand_name' => 'Norvasc', 'category_id' => $categories['CARDIO']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '5mg', 'unit' => 'piece', 'manufacturer' => 'Pfizer', 'cost_price' => 0.10, 'selling_price' => 0.40, 'reorder_level' => 400, 'minimum_stock' => 100, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Metoprolol 50mg', 'generic_name' => 'Metoprolol', 'brand_name' => 'Lopressor', 'category_id' => $categories['CARDIO']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '50mg', 'unit' => 'piece', 'manufacturer' => 'Novartis', 'cost_price' => 0.08, 'selling_price' => 0.30, 'reorder_level' => 350, 'minimum_stock' => 100, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Lisinopril 10mg', 'generic_name' => 'Lisinopril', 'brand_name' => 'Zestril', 'category_id' => $categories['CARDIO']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '10mg', 'unit' => 'piece', 'manufacturer' => 'AstraZeneca', 'cost_price' => 0.12, 'selling_price' => 0.45, 'reorder_level' => 400, 'minimum_stock' => 100, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Atorvastatin 20mg', 'generic_name' => 'Atorvastatin', 'brand_name' => 'Lipitor', 'category_id' => $categories['CARDIO']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '20mg', 'unit' => 'piece', 'manufacturer' => 'Pfizer', 'cost_price' => 0.20, 'selling_price' => 0.75, 'reorder_level' => 300, 'minimum_stock' => 75, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Warfarin 5mg', 'generic_name' => 'Warfarin', 'brand_name' => 'Coumadin', 'category_id' => $categories['CARDIO']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '5mg', 'unit' => 'piece', 'manufacturer' => 'Bristol-Myers', 'cost_price' => 0.05, 'selling_price' => 0.25, 'reorder_level' => 200, 'minimum_stock' => 50, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],

            // Antidiabetics
            ['name' => 'Metformin 500mg', 'generic_name' => 'Metformin', 'brand_name' => 'Glucophage', 'category_id' => $categories['ANTIDIABETIC']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '500mg', 'unit' => 'piece', 'manufacturer' => 'Merck', 'cost_price' => 0.03, 'selling_price' => 0.15, 'reorder_level' => 600, 'minimum_stock' => 200, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Glimepiride 2mg', 'generic_name' => 'Glimepiride', 'brand_name' => 'Amaryl', 'category_id' => $categories['ANTIDIABETIC']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '2mg', 'unit' => 'piece', 'manufacturer' => 'Sanofi', 'cost_price' => 0.10, 'selling_price' => 0.40, 'reorder_level' => 250, 'minimum_stock' => 75, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Insulin Glargine', 'generic_name' => 'Insulin Glargine', 'brand_name' => 'Lantus', 'category_id' => $categories['ANTIDIABETIC']->id ?? null, 'dosage_form' => 'Injection', 'strength' => '100 units/ml', 'unit' => 'vial', 'manufacturer' => 'Sanofi', 'cost_price' => 25.00, 'selling_price' => 45.00, 'reorder_level' => 50, 'minimum_stock' => 20, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],

            // Antacids
            ['name' => 'Omeprazole 20mg', 'generic_name' => 'Omeprazole', 'brand_name' => 'Prilosec', 'category_id' => $categories['ANTACID']->id ?? null, 'dosage_form' => 'Capsule', 'strength' => '20mg', 'unit' => 'piece', 'manufacturer' => 'AstraZeneca', 'cost_price' => 0.05, 'selling_price' => 0.25, 'reorder_level' => 500, 'minimum_stock' => 150, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Ranitidine 150mg', 'generic_name' => 'Ranitidine', 'brand_name' => 'Zantac', 'category_id' => $categories['ANTACID']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '150mg', 'unit' => 'piece', 'manufacturer' => 'GSK', 'cost_price' => 0.03, 'selling_price' => 0.15, 'reorder_level' => 400, 'minimum_stock' => 100, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Pantoprazole 40mg', 'generic_name' => 'Pantoprazole', 'brand_name' => 'Protonix', 'category_id' => $categories['ANTACID']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '40mg', 'unit' => 'piece', 'manufacturer' => 'Wyeth', 'cost_price' => 0.15, 'selling_price' => 0.50, 'reorder_level' => 350, 'minimum_stock' => 100, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],

            // Antihistamines
            ['name' => 'Cetirizine 10mg', 'generic_name' => 'Cetirizine', 'brand_name' => 'Zyrtec', 'category_id' => $categories['ANTIHIST']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '10mg', 'unit' => 'piece', 'manufacturer' => 'Pfizer', 'cost_price' => 0.05, 'selling_price' => 0.20, 'reorder_level' => 600, 'minimum_stock' => 200, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Loratadine 10mg', 'generic_name' => 'Loratadine', 'brand_name' => 'Claritin', 'category_id' => $categories['ANTIHIST']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '10mg', 'unit' => 'piece', 'manufacturer' => 'Bayer', 'cost_price' => 0.04, 'selling_price' => 0.18, 'reorder_level' => 500, 'minimum_stock' => 150, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Diphenhydramine 25mg', 'generic_name' => 'Diphenhydramine', 'brand_name' => 'Benadryl', 'category_id' => $categories['ANTIHIST']->id ?? null, 'dosage_form' => 'Capsule', 'strength' => '25mg', 'unit' => 'piece', 'manufacturer' => 'Johnson & Johnson', 'cost_price' => 0.03, 'selling_price' => 0.12, 'reorder_level' => 400, 'minimum_stock' => 100, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],

            // Anti-inflammatory
            ['name' => 'Naproxen 500mg', 'generic_name' => 'Naproxen', 'brand_name' => 'Aleve', 'category_id' => $categories['ANTI-INFLAM']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '500mg', 'unit' => 'piece', 'manufacturer' => 'Bayer', 'cost_price' => 0.08, 'selling_price' => 0.30, 'reorder_level' => 400, 'minimum_stock' => 100, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Prednisone 5mg', 'generic_name' => 'Prednisone', 'brand_name' => 'Deltasone', 'category_id' => $categories['CORTICO']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '5mg', 'unit' => 'piece', 'manufacturer' => 'Roxane', 'cost_price' => 0.02, 'selling_price' => 0.10, 'reorder_level' => 300, 'minimum_stock' => 100, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],

            // Bronchodilators
            ['name' => 'Salbutamol 100mcg', 'generic_name' => 'Salbutamol', 'brand_name' => 'Ventolin', 'category_id' => $categories['BRONCHO']->id ?? null, 'dosage_form' => 'Inhaler', 'strength' => '100mcg/dose', 'unit' => 'unit', 'manufacturer' => 'GSK', 'cost_price' => 3.00, 'selling_price' => 8.00, 'reorder_level' => 100, 'minimum_stock' => 30, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Theophylline 200mg', 'generic_name' => 'Theophylline', 'brand_name' => 'Theo-Dur', 'category_id' => $categories['BRONCHO']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '200mg', 'unit' => 'piece', 'manufacturer' => 'Schering', 'cost_price' => 0.10, 'selling_price' => 0.40, 'reorder_level' => 200, 'minimum_stock' => 50, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],

            // Diuretics
            ['name' => 'Furosemide 40mg', 'generic_name' => 'Furosemide', 'brand_name' => 'Lasix', 'category_id' => $categories['DIURETIC']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '40mg', 'unit' => 'piece', 'manufacturer' => 'Sanofi', 'cost_price' => 0.03, 'selling_price' => 0.15, 'reorder_level' => 300, 'minimum_stock' => 75, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Spironolactone 25mg', 'generic_name' => 'Spironolactone', 'brand_name' => 'Aldactone', 'category_id' => $categories['DIURETIC']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '25mg', 'unit' => 'piece', 'manufacturer' => 'Pfizer', 'cost_price' => 0.08, 'selling_price' => 0.35, 'reorder_level' => 200, 'minimum_stock' => 50, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],

            // Vitamins & Supplements
            ['name' => 'Vitamin C 500mg', 'generic_name' => 'Ascorbic Acid', 'brand_name' => 'C-500', 'category_id' => $categories['VITAMIN']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '500mg', 'unit' => 'piece', 'manufacturer' => 'Nature Made', 'cost_price' => 0.02, 'selling_price' => 0.08, 'reorder_level' => 1000, 'minimum_stock' => 500, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Vitamin D3 1000IU', 'generic_name' => 'Cholecalciferol', 'brand_name' => 'D3-1000', 'category_id' => $categories['VITAMIN']->id ?? null, 'dosage_form' => 'Softgel', 'strength' => '1000IU', 'unit' => 'piece', 'manufacturer' => 'Nature Made', 'cost_price' => 0.05, 'selling_price' => 0.15, 'reorder_level' => 800, 'minimum_stock' => 300, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'B-Complex Tablet', 'generic_name' => 'B Vitamins', 'brand_name' => 'B-Complex', 'category_id' => $categories['VITAMIN']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => 'Complex', 'unit' => 'piece', 'manufacturer' => 'Centrum', 'cost_price' => 0.08, 'selling_price' => 0.25, 'reorder_level' => 600, 'minimum_stock' => 200, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Ferrous Sulfate 325mg', 'generic_name' => 'Iron', 'brand_name' => 'Feosol', 'category_id' => $categories['VITAMIN']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '325mg', 'unit' => 'piece', 'manufacturer' => 'Apex', 'cost_price' => 0.03, 'selling_price' => 0.12, 'reorder_level' => 500, 'minimum_stock' => 150, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Calcium 600mg + D3', 'generic_name' => 'Calcium Carbonate', 'brand_name' => 'Caltrate', 'category_id' => $categories['VITAMIN']->id ?? null, 'dosage_form' => 'Tablet', 'strength' => '600mg + 800IU', 'unit' => 'piece', 'manufacturer' => 'Pfizer', 'cost_price' => 0.10, 'selling_price' => 0.30, 'reorder_level' => 700, 'minimum_stock' => 250, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],

            // Vaccines
            ['name' => 'Influenza Vaccine', 'generic_name' => 'Flu Vaccine', 'brand_name' => 'Fluzone', 'category_id' => $categories['VACCINE']->id ?? null, 'dosage_form' => 'Injection', 'strength' => '0.5ml', 'unit' => 'vial', 'manufacturer' => 'Sanofi Pasteur', 'cost_price' => 15.00, 'selling_price' => 35.00, 'reorder_level' => 50, 'minimum_stock' => 20, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false, 'is_vaccine' => true],
            ['name' => 'Hepatitis B Vaccine', 'generic_name' => 'Hep B Vaccine', 'brand_name' => 'Engerix-B', 'category_id' => $categories['VACCINE']->id ?? null, 'dosage_form' => 'Injection', 'strength' => '20mcg/ml', 'unit' => 'vial', 'manufacturer' => 'GSK', 'cost_price' => 25.00, 'selling_price' => 55.00, 'reorder_level' => 30, 'minimum_stock' => 10, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false, 'is_vaccine' => true],

            // Eye Drops
            ['name' => 'Artificial Tears', 'generic_name' => 'Lubricant', 'brand_name' => 'Refresh Tears', 'category_id' => $categories['EYEDROP']->id ?? null, 'dosage_form' => 'Eye Drops', 'strength' => 'Solution', 'unit' => 'bottle', 'manufacturer' => 'Allergan', 'cost_price' => 2.00, 'selling_price' => 8.00, 'reorder_level' => 100, 'minimum_stock' => 30, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Ciprofloxacin Eye Drops', 'generic_name' => 'Ciprofloxacin', 'brand_name' => 'Ciloxan', 'category_id' => $categories['EYEDROP']->id ?? null, 'dosage_form' => 'Eye Drops', 'strength' => '0.3%', 'unit' => 'bottle', 'manufacturer' => 'Alcon', 'cost_price' => 5.00, 'selling_price' => 15.00, 'reorder_level' => 50, 'minimum_stock' => 15, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],

            // Topical
            ['name' => 'Hydrocortisone 1% Cream', 'generic_name' => 'Hydrocortisone', 'brand_name' => 'Cortizone', 'category_id' => $categories['TOPICAL']->id ?? null, 'dosage_form' => 'Cream', 'strength' => '1%', 'unit' => 'tube', 'manufacturer' => 'Pfizer', 'cost_price' => 1.50, 'selling_price' => 5.00, 'reorder_level' => 100, 'minimum_stock' => 30, 'requires_prescription' => false, 'is_active' => true, 'is_controlled' => false],
            ['name' => 'Mupirocin 2% Ointment', 'generic_name' => 'Mupirocin', 'brand_name' => 'Bactroban', 'category_id' => $categories['TOPICAL']->id ?? null, 'dosage_form' => 'Ointment', 'strength' => '2%', 'unit' => 'tube', 'manufacturer' => 'GSK', 'cost_price' => 3.00, 'selling_price' => 10.00, 'reorder_level' => 75, 'minimum_stock' => 20, 'requires_prescription' => true, 'is_active' => true, 'is_controlled' => false],
        ];

        foreach ($medicines as $medicine) {
            $exists = Medicine::where('name', $medicine['name'])->where('strength', $medicine['strength'])->exists();
            if (!$exists) {
                $medicine['medicine_code'] = Medicine::generateCode();
                Medicine::create($medicine);
            }
        }
    }
}
