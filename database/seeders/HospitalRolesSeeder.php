<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class HospitalRolesSeeder extends Seeder
{
    public function run(): void
    {
        $doctorPermissions = [
            'appointments.view',
            'appointments.create',
            'appointments.update',
            'appointments.delete',
            'patients.view',
            'patients.create',
            'patients.update',
            'patients.delete',
            'medical_records.view',
            'medical_records.create',
            'medical_records.update',
            'medical_records.delete',
            'prescriptions.view',
            'prescriptions.create',
            'prescriptions.update',
            'prescriptions.delete',
            'lab_tests.view',
            'lab_tests.create',
            'lab_tests.update',
            'lab_tests.delete',
            'vitals.view',
            'vitals.create',
            'vitals.update',
            'vitals.delete',
            'services.view',
            'services.create',
            'services.update',
            'insurances.view',
            'insurances.create',
            'insurances.update',
            'doctor_schedules.view',
            'doctor_schedules.create',
            'doctor_schedules.update',
            'doctor_schedules.delete',
            'patient_queues.view',
            'patient_queues.create',
            'patient_queues.update',
            'opd_records.view',
            'opd_records.create',
            'opd_records.update',
            'opd_records.delete',
            'operation_theatres.view',
            'surgery_schedules.view',
            'surgery_schedules.create',
            'surgery_schedules.update',
        ];

        $receptionPermissions = [
            'appointments.view',
            'appointments.create',
            'appointments.update',
            'appointments.delete',
            'patients.view',
            'patients.create',
            'patients.update',
            'patients.delete',
            'billings.view',
            'billings.create',
            'billings.update',
            'billings.delete',
            'lab_tests.view',
            'lab_tests.create',
            'vitals.view',
            'vitals.create',
            'vitals.update',
            'services.view',
            'insurances.view',
            'insurances.create',
            'insurances.update',
            'insurances.delete',
            'ipd_records.view',
            'ipd_records.create',
            'ipd_records.update',
            'ipd_records.delete',
            'doctor_schedules.view',
            'patient_queues.view',
            'patient_queues.create',
            'patient_queues.update',
            'patient_queues.delete',
            'opd_records.view',
            'opd_records.create',
            'opd_records.update',
            'opd_records.delete',
            'operation_theatres.view',
            'surgery_schedules.view',
        ];

        foreach ($doctorPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        foreach ($receptionPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $doctorRole = Role::firstOrCreate(['name' => 'doctor', 'guard_name' => 'web']);
        $doctorRole->syncPermissions($doctorPermissions);

        $receptionRole = Role::firstOrCreate(['name' => 'reception', 'guard_name' => 'web']);
        $receptionRole->syncPermissions($receptionPermissions);
    }
}
