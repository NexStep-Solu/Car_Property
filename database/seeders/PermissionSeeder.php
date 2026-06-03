<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * All permissions used in the application (sidebar, create, edit, view, delete).
     */
    protected array $permissions = [
        // Users
        'view_users',
        'view_user',
        'create_user',
        'update_user',
        'active_user',
        // Roles
        'view_roles',
        'create_roles',
        'update_roles',
        'delete_roles',
        // Permissions
        'view_permissions',
        'create_permissions',
        'update_permissions',
        'delete_permissions',
        // Branches
        'view_branches',
        'create_branches',
        'update_branches',
        'delete_branches',
        // Departments
        'view_departments',
        'create_departments',
        'update_departments',
        'delete_departments',
        // Locations
        'view_locations',
        'create_locations',
        'update_locations',
        'delete_locations',
        // Currencies
        'view_currencies',
        'create_currencies',
        'update_currencies',
        'delete_currencies',

        // Hospital ERP (Master Setup): Room Types
        'view_room_types',
        'create_room_types',
        'update_room_types',
        'delete_room_types',

        // Hospital ERP (Master Setup): Rooms
        'view_rooms',
        'create_rooms',
        'update_rooms',
        'delete_rooms',

        // Hospital ERP (Master Setup): Beds
        'view_beds',
        'create_beds',
        'update_beds',
        'delete_beds',

        // Customers
        'view_customers',
        'create_customers',
        'update_customers',

        // Pharmacy: Suppliers
        'view_suppliers',
        'create_suppliers',
        'update_suppliers',
        'delete_suppliers',

        // Pharmacy: Medicine Categories
        'view_medicine_categories',
        'create_medicine_categories',
        'update_medicine_categories',
        'delete_medicine_categories',

        // Pharmacy: Medicines
        'view_medicines',
        'create_medicines',
        'update_medicines',
        'delete_medicines',

        // Pharmacy: Inventory
        'view_inventory',
        'create_inventory',
        'update_inventory',
        'delete_inventory',
        'adjust_inventory',

        // Pharmacy: Stock Movements
        'view_stock_movements',
        'create_stock_movements',

        // Pharmacy: Purchase Orders
        'view_purchase_orders',
        'create_purchase_orders',
        'update_purchase_orders',
        'delete_purchase_orders',
        'receive_purchase_orders',

        // Patients
        'view_patients',
        'create_patients',
        'update_patients',
        'delete_patients',

        // Hospital Modules: Appointments
        'appointments.view',
        'appointments.create',
        'appointments.update',
        'appointments.delete',

        // Hospital Modules: Patients
        'patients.view',
        'patients.create',
        'patients.update',
        'patients.delete',

        // Hospital Modules: Medical Records
        'medical_records.view',
        'medical_records.create',
        'medical_records.update',
        'medical_records.delete',

        // Hospital Modules: Prescriptions
        'prescriptions.view',
        'prescriptions.create',
        'prescriptions.update',
        'prescriptions.delete',

        // Hospital Modules: Lab Tests
        'lab_tests.view',
        'lab_tests.create',
        'lab_tests.update',
        'lab_tests.delete',

        // Hospital Modules: Vitals
        'vitals.view',
        'vitals.create',
        'vitals.update',
        'vitals.delete',

        // Hospital Modules: Services
        'services.view',
        'services.create',
        'services.update',
        'services.delete',

        // Hospital Modules: Insurances
        'insurances.view',
        'insurances.create',
        'insurances.update',
        'insurances.delete',

        // Hospital Modules: IPD Records
        'ipd_records.view',
        'ipd_records.create',
        'ipd_records.update',
        'ipd_records.delete',

        // Hospital Modules: Billings
        'billings.view',
        'billings.create',
        'billings.update',
        'billings.delete',

        // Employees
        'view_employees',
        'create_employees',
        'update_employees',
        'delete_employees',

        // Hospital Modules: Doctor Schedules
        'doctor_schedules.view',
        'doctor_schedules.create',
        'doctor_schedules.update',
        'doctor_schedules.delete',

        // Hospital Modules: Patient Queues
        'patient_queues.view',
        'patient_queues.create',
        'patient_queues.update',
        'patient_queues.delete',

        // Hospital Modules: OPD Records
        'opd_records.view',
        'opd_records.create',
        'opd_records.update',
        'opd_records.delete',

        // Hospital Modules: Operation Theaters
        'operation_theatres.view',
        'operation_theatres.create',
        'operation_theatres.update',
        'operation_theatres.delete',

        // Hospital Modules: Surgery Schedules
        'surgery_schedules.view',
        'surgery_schedules.create',
        'surgery_schedules.update',
        'surgery_schedules.delete',
    ];

    /**
     * Admin email that receives all permissions.
     * Set ADMIN_EMAIL in .env to use a different email.
     */
    protected function adminEmail(): string
    {
        return config('app.admin_email', env('ADMIN_EMAIL', 'admin@gmail.com'));
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $guardName = config('auth.defaults.guard', 'web');
        $adminEmail = $this->adminEmail();

        foreach ($this->permissions as $name) {
            Permission::firstOrCreate(
                ['name' => $name, 'guard_name' => $guardName],
                ['name' => $name, 'guard_name' => $guardName]
            );
        }

        $adminUser = User::where('email', $adminEmail)->first();

        if ($adminUser) {
            $adminUser->givePermissionTo(Permission::all());
            $this->command->info("All permissions assigned to admin user: {$adminEmail}");
        } else {
            $this->command->warn("Admin user with email '{$adminEmail}' not found. Run DatabaseSeeder first or create the user.");
        }

        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo(Permission::all());
            $this->command->info("All permissions assigned to admin role.");
        }
    }
}
