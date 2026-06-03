<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\Department;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::all()->keyBy('name');

        $services = [
            // General Medicine Services
            ['name' => 'General Consultation', 'code' => 'CONSULT-GEN', 'description' => 'Standard consultation with general physician', 'category' => 'Consultation', 'price' => 50.00, 'duration_minutes' => 30, 'department_id' => $departments['General Medicine']->id ?? null, 'status' => 'active'],
            ['name' => 'Follow-up Consultation', 'code' => 'CONSULT-FOLLOW', 'description' => 'Follow-up visit for existing patients', 'category' => 'Consultation', 'price' => 30.00, 'duration_minutes' => 15, 'department_id' => $departments['General Medicine']->id ?? null, 'status' => 'active'],
            
            // Cardiology Services
            ['name' => 'Cardiology Consultation', 'code' => 'CONSULT-CARDIO', 'description' => 'Specialist consultation with cardiologist', 'category' => 'Consultation', 'price' => 150.00, 'duration_minutes' => 45, 'department_id' => $departments['Cardiology']->id ?? null, 'status' => 'active'],
            ['name' => 'ECG (12-Lead)', 'code' => 'PROC-ECG', 'description' => 'Electrocardiogram with 12 leads', 'category' => 'Diagnostic', 'price' => 75.00, 'duration_minutes' => 30, 'department_id' => $departments['Cardiology']->id ?? null, 'status' => 'active'],
            ['name' => 'Echocardiogram', 'code' => 'PROC-ECHO', 'description' => 'Heart ultrasound examination', 'category' => 'Diagnostic', 'price' => 250.00, 'duration_minutes' => 45, 'department_id' => $departments['Cardiology']->id ?? null, 'status' => 'active'],
            ['name' => 'Stress Test', 'code' => 'PROC-STRESS', 'description' => 'Treadmill stress test with ECG monitoring', 'category' => 'Diagnostic', 'price' => 200.00, 'duration_minutes' => 60, 'department_id' => $departments['Cardiology']->id ?? null, 'status' => 'active'],
            
            // Pediatrics Services
            ['name' => 'Pediatric Consultation', 'code' => 'CONSULT-PED', 'description' => 'Consultation with pediatrician', 'category' => 'Consultation', 'price' => 80.00, 'duration_minutes' => 30, 'department_id' => $departments['Pediatrics']->id ?? null, 'status' => 'active'],
            ['name' => 'Vaccination Service', 'code' => 'PROC-VACC', 'description' => 'Administration of vaccines', 'category' => 'Procedure', 'price' => 35.00, 'duration_minutes' => 15, 'department_id' => $departments['Pediatrics']->id ?? null, 'status' => 'active'],
            
            // Laboratory Services
            ['name' => 'Complete Blood Count (CBC)', 'code' => 'LAB-CBC', 'description' => 'Complete blood count with differential', 'category' => 'Laboratory', 'price' => 25.00, 'duration_minutes' => 10, 'department_id' => null, 'status' => 'active'],
            ['name' => 'Lipid Profile', 'code' => 'LAB-LIPID', 'description' => 'Cholesterol and triglyceride panel', 'category' => 'Laboratory', 'price' => 35.00, 'duration_minutes' => 10, 'department_id' => null, 'status' => 'active'],
            ['name' => 'Blood Glucose Test', 'code' => 'LAB-GLUCOSE', 'description' => 'Fasting blood glucose measurement', 'category' => 'Laboratory', 'price' => 15.00, 'duration_minutes' => 5, 'department_id' => null, 'status' => 'active'],
            ['name' => 'HbA1c Test', 'code' => 'LAB-HBA1C', 'description' => 'Glycated hemoglobin test for diabetes monitoring', 'category' => 'Laboratory', 'price' => 30.00, 'duration_minutes' => 10, 'department_id' => null, 'status' => 'active'],
            ['name' => 'Thyroid Function Test', 'code' => 'LAB-THYROID', 'description' => 'TSH, T3, T4 panel', 'category' => 'Laboratory', 'price' => 45.00, 'duration_minutes' => 10, 'department_id' => null, 'status' => 'active'],
            ['name' => 'Liver Function Test', 'code' => 'LAB-LFT', 'description' => 'Complete liver function panel', 'category' => 'Laboratory', 'price' => 40.00, 'duration_minutes' => 10, 'department_id' => null, 'status' => 'active'],
            ['name' => 'Kidney Function Test', 'code' => 'LAB-KFT', 'description' => 'BUN, Creatinine, eGFR panel', 'category' => 'Laboratory', 'price' => 35.00, 'duration_minutes' => 10, 'department_id' => null, 'status' => 'active'],
            ['name' => 'Urinalysis', 'code' => 'LAB-URINE', 'description' => 'Complete urine examination', 'category' => 'Laboratory', 'price' => 12.00, 'duration_minutes' => 10, 'department_id' => null, 'status' => 'active'],
            ['name' => 'Hepatitis B Surface Antigen', 'code' => 'LAB-HBSAG', 'description' => 'HBsAg screening test', 'category' => 'Laboratory', 'price' => 20.00, 'duration_minutes' => 10, 'department_id' => null, 'status' => 'active'],
            
            // Radiology Services
            ['name' => 'Chest X-Ray (PA View)', 'code' => 'RAD-CHESTPA', 'description' => 'Posteroanterior chest X-ray', 'category' => 'Radiology', 'price' => 50.00, 'duration_minutes' => 15, 'department_id' => null, 'status' => 'active'],
            ['name' => 'Abdominal Ultrasound', 'code' => 'RAD-US-ABD', 'description' => 'Complete abdominal ultrasound scan', 'category' => 'Radiology', 'price' => 120.00, 'duration_minutes' => 30, 'department_id' => null, 'status' => 'active'],
            ['name' => 'CT Scan (Head)', 'code' => 'RAD-CT-HEAD', 'description' => 'Computed tomography of the head', 'category' => 'Radiology', 'price' => 350.00, 'duration_minutes' => 30, 'department_id' => null, 'status' => 'active'],
            ['name' => 'MRI (Brain)', 'code' => 'RAD-MRI-BRAIN', 'description' => 'Magnetic resonance imaging of the brain', 'category' => 'Radiology', 'price' => 600.00, 'duration_minutes' => 45, 'department_id' => null, 'status' => 'active'],
            ['name' => 'Bone Densitometry (DEXA)', 'code' => 'RAD-DEXA', 'description' => 'Bone density scan for osteoporosis screening', 'category' => 'Radiology', 'price' => 150.00, 'duration_minutes' => 20, 'department_id' => null, 'status' => 'active'],
            
            // Nursing Services
            ['name' => 'IV Cannulation', 'code' => 'NURSE-IVCANN', 'description' => 'Peripheral intravenous catheter insertion', 'category' => 'Nursing', 'price' => 25.00, 'duration_minutes' => 15, 'department_id' => null, 'status' => 'active'],
            ['name' => 'Wound Dressing', 'code' => 'NURSE-WOUND', 'description' => 'Basic wound care and dressing', 'category' => 'Nursing', 'price' => 30.00, 'duration_minutes' => 20, 'department_id' => null, 'status' => 'active'],
            ['name' => 'Injection Administration', 'code' => 'NURSE-INJ', 'description' => 'Intramuscular or subcutaneous injection', 'category' => 'Nursing', 'price' => 10.00, 'duration_minutes' => 5, 'department_id' => null, 'status' => 'active'],
            ['name' => 'Nebulization', 'code' => 'NURSE-NEB', 'description' => 'Respiratory nebulizer treatment', 'category' => 'Nursing', 'price' => 20.00, 'duration_minutes' => 15, 'department_id' => null, 'status' => 'active'],
            
            // Emergency Services
            ['name' => 'Emergency Room Visit', 'code' => 'ER-VISIT', 'description' => 'Emergency department consultation', 'category' => 'Emergency', 'price' => 200.00, 'duration_minutes' => 60, 'department_id' => null, 'status' => 'active'],
            ['name' => 'Ambulance Service (Local)', 'code' => 'AMB-LOCAL', 'description' => 'Local ambulance transport service', 'category' => 'Emergency', 'price' => 100.00, 'duration_minutes' => 30, 'department_id' => null, 'status' => 'active'],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(
                ['code' => $service['code']],
                $service
            );
        }
    }
}
