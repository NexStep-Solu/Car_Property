<?php

namespace Database\Seeders;

use App\Models\Patient;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        $patients = [
            ['name' => 'John Anderson', 'date_of_birth' => '1985-03-15', 'gender' => 'Male', 'blood_group' => 'A+', 'marital_status' => 'Married', 'occupation' => 'Engineer', 'nationality' => 'American', 'preferred_language' => 'English', 'registration_date' => now()->subDays(30), 'emergency_contact_name' => 'Mary Anderson', 'emergency_contact_phone' => '+1-555-1001', 'emergency_contact_relation' => 'Spouse', 'diagnosis' => 'Type 2 Diabetes Mellitus', 'notes' => 'Regular follow-up required'],
            ['name' => 'Emily Brown', 'date_of_birth' => '1992-07-22', 'gender' => 'Female', 'blood_group' => 'O-', 'marital_status' => 'Single', 'occupation' => 'Teacher', 'nationality' => 'American', 'preferred_language' => 'English', 'registration_date' => now()->subDays(25), 'emergency_contact_name' => 'Robert Brown', 'emergency_contact_phone' => '+1-555-1002', 'emergency_contact_relation' => 'Father', 'diagnosis' => 'Hypertension', 'notes' => 'Blood pressure monitoring'],
            ['name' => 'Michael Chen', 'date_of_birth' => '1978-11-08', 'gender' => 'Male', 'blood_group' => 'B+', 'marital_status' => 'Married', 'occupation' => 'Businessman', 'nationality' => 'Chinese', 'preferred_language' => 'Mandarin', 'registration_date' => now()->subDays(20), 'emergency_contact_name' => 'Lin Chen', 'emergency_contact_phone' => '+1-555-1003', 'emergency_contact_relation' => 'Wife', 'diagnosis' => 'Coronary Artery Disease'],
            ['name' => 'Sarah Johnson', 'date_of_birth' => '1990-05-14', 'gender' => 'Female', 'blood_group' => 'AB+', 'marital_status' => 'Married', 'occupation' => 'Doctor', 'nationality' => 'American', 'preferred_language' => 'English', 'registration_date' => now()->subDays(15), 'emergency_contact_name' => 'David Johnson', 'emergency_contact_phone' => '+1-555-1004', 'emergency_contact_relation' => 'Husband', 'diagnosis' => 'Asthma'],
            ['name' => 'Robert Williams', 'date_of_birth' => '1965-02-28', 'gender' => 'Male', 'blood_group' => 'A-', 'marital_status' => 'Divorced', 'occupation' => 'Retired', 'nationality' => 'American', 'preferred_language' => 'English', 'registration_date' => now()->subDays(10), 'emergency_contact_name' => 'Jennifer Williams', 'emergency_contact_phone' => '+1-555-1005', 'emergency_contact_relation' => 'Daughter', 'diagnosis' => 'Chronic Obstructive Pulmonary Disease', 'notes' => 'Smoking history'],
            ['name' => 'Maria Garcia', 'date_of_birth' => '1988-09-03', 'gender' => 'Female', 'blood_group' => 'O+', 'marital_status' => 'Single', 'occupation' => 'Nurse', 'nationality' => 'Mexican', 'preferred_language' => 'Spanish', 'registration_date' => now()->subDays(8), 'emergency_contact_name' => 'Carlos Garcia', 'emergency_contact_phone' => '+1-555-1006', 'emergency_contact_relation' => 'Brother', 'diagnosis' => 'Migraine'],
            ['name' => 'James Thompson', 'date_of_birth' => '1955-12-19', 'gender' => 'Male', 'blood_group' => 'B-', 'marital_status' => 'Married', 'occupation' => 'Professor', 'nationality' => 'British', 'preferred_language' => 'English', 'registration_date' => now()->subDays(7), 'emergency_contact_name' => 'Elizabeth Thompson', 'emergency_contact_phone' => '+1-555-1007', 'emergency_contact_relation' => 'Wife', 'diagnosis' => 'Atrial Fibrillation', 'notes' => 'On anticoagulation'],
            ['name' => 'Lisa Davis', 'date_of_birth' => '1976-06-25', 'gender' => 'Female', 'blood_group' => 'A+', 'marital_status' => 'Married', 'occupation' => 'Architect', 'nationality' => 'American', 'preferred_language' => 'English', 'registration_date' => now()->subDays(5), 'emergency_contact_name' => 'Mark Davis', 'emergency_contact_phone' => '+1-555-1008', 'emergency_contact_relation' => 'Husband', 'diagnosis' => 'Hypothyroidism'],
            ['name' => 'David Martinez', 'date_of_birth' => '1995-08-11', 'gender' => 'Male', 'blood_group' => 'AB-', 'marital_status' => 'Single', 'occupation' => 'Software Developer', 'nationality' => 'American', 'preferred_language' => 'English', 'registration_date' => now()->subDays(3), 'emergency_contact_name' => 'Rosa Martinez', 'emergency_contact_phone' => '+1-555-1009', 'emergency_contact_relation' => 'Mother', 'diagnosis' => 'Acute Bronchitis'],
            ['name' => 'Jennifer Wilson', 'date_of_birth' => '1982-04-07', 'gender' => 'Female', 'blood_group' => 'O-', 'marital_status' => 'Widowed', 'occupation' => 'Accountant', 'nationality' => 'American', 'preferred_language' => 'English', 'registration_date' => now()->subDays(2), 'emergency_contact_name' => 'Thomas Wilson', 'emergency_contact_phone' => '+1-555-1010', 'emergency_contact_relation' => 'Brother', 'diagnosis' => 'Gastroesophageal Reflux Disease'],
            ['name' => 'Christopher Lee', 'date_of_birth' => '1980-10-30', 'gender' => 'Male', 'blood_group' => 'A-', 'marital_status' => 'Married', 'occupation' => 'Lawyer', 'nationality' => 'American', 'preferred_language' => 'English', 'registration_date' => now()->subDays(1), 'emergency_contact_name' => 'Sophia Lee', 'emergency_contact_phone' => '+1-555-1011', 'emergency_contact_relation' => 'Wife', 'diagnosis' => 'Insomnia'],
            ['name' => 'Amanda Taylor', 'date_of_birth' => '1998-01-15', 'gender' => 'Female', 'blood_group' => 'B+', 'marital_status' => 'Single', 'occupation' => 'Student', 'nationality' => 'Canadian', 'preferred_language' => 'English', 'registration_date' => now(), 'emergency_contact_name' => 'Paul Taylor', 'emergency_contact_phone' => '+1-555-1012', 'emergency_contact_relation' => 'Father', 'diagnosis' => 'Anxiety Disorder'],
        ];

        foreach ($patients as $patient) {
            $email = strtolower(str_replace(' ', '.', $patient['name'])) . '@example.com';
            Patient::firstOrCreate(
                ['email' => $email],
                array_merge($patient, ['email' => $email])
            );
        }
    }
}
