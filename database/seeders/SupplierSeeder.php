<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            [
                'supplier_code' => 'AAA',
                'name' => 'PharmaCare Distributors',
                'contact_person' => 'Michael Thompson',
                'email' => 'michael@pharmacare.com',
                'phone' => '+1-555-0101',
                'mobile' => '+1-555-0102',
                'address' => '1234 Distribution Way',
                'city' => 'New York',
                'state' => 'NY',
                'country' => 'USA',
                'postal_code' => '10001',
                'tax_id' => 'TAX-001234567',
                'license_number' => 'LIC-PHARMA-2024-001',
                'credit_limit' => 500000.00,
                'payment_terms_days' => 30,
                'rating' => 'A',
                'is_active' => true,
            ],
            [
                'supplier_code' => 'BBB',
                'name' => 'MediSupply International',
                'contact_person' => 'Sarah Johnson',
                'email' => 'sarah@medisupply.com',
                'phone' => '+1-555-0201',
                'mobile' => '+1-555-0202',
                'address' => '5678 Healthcare Blvd',
                'city' => 'Los Angeles',
                'state' => 'CA',
                'country' => 'USA',
                'postal_code' => '90001',
                'tax_id' => 'TAX-007654321',
                'license_number' => 'LIC-MEDI-2024-002',
                'credit_limit' => 750000.00,
                'payment_terms_days' => 45,
                'rating' => 'A',
                'is_active' => true,
            ],
            [
                'supplier_code' => 'CCC',
                'name' => 'GenericMeds Co.',
                'contact_person' => 'David Chen',
                'email' => 'david@genericmeds.com',
                'phone' => '+1-555-0301',
                'mobile' => '+1-555-0302',
                'address' => '910 Generic Lane',
                'city' => 'Chicago',
                'state' => 'IL',
                'country' => 'USA',
                'postal_code' => '60601',
                'tax_id' => 'TAX-003321654',
                'license_number' => 'LIC-GEN-2024-003',
                'credit_limit' => 300000.00,
                'payment_terms_days' => 30,
                'rating' => 'B',
                'is_active' => true,
            ],
            [
                'supplier_code' => 'DDD',
                'name' => 'BioLife Pharmaceuticals',
                'contact_person' => 'Emily White',
                'email' => 'emily@biolife.com',
                'phone' => '+1-555-0401',
                'mobile' => '+1-555-0402',
                'address' => '2468 Bio Drive',
                'city' => 'San Francisco',
                'state' => 'CA',
                'country' => 'USA',
                'postal_code' => '94101',
                'tax_id' => 'TAX-004789012',
                'license_number' => 'LIC-BIO-2024-004',
                'credit_limit' => 1000000.00,
                'payment_terms_days' => 60,
                'rating' => 'A',
                'is_active' => true,
            ],
            [
                'supplier_code' => 'EEE',
                'name' => 'Wellness Pharmacy Supplies',
                'contact_person' => 'Robert Martinez',
                'email' => 'robert@wellnesspharma.com',
                'phone' => '+1-555-0501',
                'mobile' => '+1-555-0502',
                'address' => '1357 Wellness Ave',
                'city' => 'Miami',
                'state' => 'FL',
                'country' => 'USA',
                'postal_code' => '33101',
                'tax_id' => 'TAX-005678901',
                'license_number' => 'LIC-WELL-2024-005',
                'credit_limit' => 250000.00,
                'payment_terms_days' => 15,
                'rating' => 'B',
                'is_active' => true,
            ],
            [
                'supplier_code' => 'FFF',
                'name' => 'QuickMed Distributors',
                'contact_person' => 'Jennifer Lee',
                'email' => 'jennifer@quickmed.com',
                'phone' => '+1-555-0601',
                'mobile' => '+1-555-0602',
                'address' => '8642 Quick Street',
                'city' => 'Seattle',
                'state' => 'WA',
                'country' => 'USA',
                'postal_code' => '98101',
                'tax_id' => 'TAX-006345678',
                'license_number' => 'LIC-QUICK-2024-006',
                'credit_limit' => 400000.00,
                'payment_terms_days' => 30,
                'rating' => 'A',
                'is_active' => true,
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::firstOrCreate(
                ['email' => $supplier['email']],
                $supplier
            );
        }
    }
}
