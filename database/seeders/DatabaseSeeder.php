<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Roles
        $this->call([
            BranchLocationCurrencySeeder::class,
        ]);

        $adminRole = Role::firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'web'],
            ['name' => 'admin', 'guard_name' => 'web']
        );

        $managerRole = Role::firstOrCreate(
            ['name' => 'manager', 'guard_name' => 'web'],
            ['name' => 'manager', 'guard_name' => 'web']
        );

        $employeeRole = Role::firstOrCreate(
            ['name' => 'employee', 'guard_name' => 'web'],
            ['name' => 'employee', 'guard_name' => 'web']
        );

        $doctorRole = Role::firstOrCreate(
            ['name' => 'doctor', 'guard_name' => 'web'],
            ['name' => 'doctor', 'guard_name' => 'web']
        );

        $receptionRole = Role::firstOrCreate(
            ['name' => 'reception', 'guard_name' => 'web'],
            ['name' => 'reception', 'guard_name' => 'web']
        );

        // 2. Create Departments
        $itDepartment = Department::firstOrCreate(['name' => 'IT'], ['description' => 'Information Technology Department']);
        $hrDepartment = Department::firstOrCreate(['name' => 'Human Resources'], ['description' => 'Human Resources Department']);
        $financeDepartment = Department::firstOrCreate(['name' => 'Finance'], ['description' => 'Finance and Accounting Department']);
        $salesDepartment = Department::firstOrCreate(['name' => 'Sales'], ['description' => 'Sales and Marketing Department']);
        $cardiologyDepartment = Department::firstOrCreate(['name' => 'Cardiology'], ['description' => 'Heart and Cardiovascular Department']);
        $pediatricsDepartment = Department::firstOrCreate(['name' => 'Pediatrics'], ['description' => 'Child Health Department']);
        $generalMedicineDepartment = Department::firstOrCreate(['name' => 'General Medicine'], ['description' => 'General Medical Department']);

        // 3. Create Admin User
        $adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
        $adminUser->assignRole($adminRole);
        $adminUser->employee()->create([
            'employee_id' => 'EMP001',
            'phone' => '+1234567890',
            'address' => '123 Admin Street',
            'date_of_birth' => '1990-01-01',
            'hire_date' => '2020-01-01',
            'position' => 'System Administrator',
            'department_id' => $itDepartment->id,
            'salary' => 75000.00,
            'status' => 'active',
        ]);

        // 4. Create Doctor Users
        $doctor1 = User::create([
            'name' => 'Dr. John Smith',
            'email' => 'doctor@gmail.com',
            'password' => Hash::make('password'),
        ]);
        $doctor1->assignRole($doctorRole);
        $doctor1->employee()->create([
            'employee_id' => 'DOC001',
            'phone' => '+1234567891',
            'address' => '456 Doctor Street',
            'date_of_birth' => '1980-05-15',
            'hire_date' => '2020-01-01',
            'position' => 'Cardiologist',
            'department_id' => $cardiologyDepartment->id,
            'salary' => 150000.00,
            'status' => 'active',
        ]);

        $doctor2 = User::create([
            'name' => 'Dr. Sarah Wilson',
            'email' => 'sarah.doc@gmail.com',
            'password' => Hash::make('password'),
        ]);
        $doctor2->assignRole($doctorRole);
        $doctor2->employee()->create([
            'employee_id' => 'DOC002',
            'phone' => '+1234567892',
            'address' => '789 Medical Ave',
            'date_of_birth' => '1982-08-20',
            'hire_date' => '2021-03-15',
            'position' => 'Pediatrician',
            'department_id' => $pediatricsDepartment->id,
            'salary' => 140000.00,
            'status' => 'active',
        ]);

        $doctor3 = User::create([
            'name' => 'Dr. James Brown',
            'email' => 'james.doc@gmail.com',
            'password' => Hash::make('password'),
        ]);
        $doctor3->assignRole($doctorRole);
        $doctor3->employee()->create([
            'employee_id' => 'DOC003',
            'phone' => '+1234567898',
            'address' => '321 Medical Center',
            'date_of_birth' => '1978-03-25',
            'hire_date' => '2019-06-01',
            'position' => 'General Physician',
            'department_id' => $generalMedicineDepartment->id,
            'salary' => 130000.00,
            'status' => 'active',
        ]);

        // 5. Create Reception User
        $reception1 = User::create([
            'name' => 'Receptionist Jane',
            'email' => 'reception@gmail.com',
            'password' => Hash::make('password'),
        ]);
        $reception1->assignRole($receptionRole);
        $reception1->employee()->create([
            'employee_id' => 'REC001',
            'phone' => '+1234567893',
            'address' => '321 Reception Blvd',
            'date_of_birth' => '1995-03-10',
            'hire_date' => '2023-01-10',
            'position' => 'Receptionist',
            'department_id' => $generalMedicineDepartment->id,
            'salary' => 35000.00,
            'status' => 'active',
        ]);

        // 6. Create Manager User
        $managerUser = User::create([
            'name' => 'John Manager',
            'email' => 'manager@gmail.com',
            'password' => Hash::make('password'),
        ]);
        $managerUser->assignRole($managerRole);
        $managerUser->employee()->create([
            'employee_id' => 'EMP002',
            'phone' => '+1234567894',
            'address' => '456 Manager Avenue',
            'date_of_birth' => '1985-05-15',
            'hire_date' => '2021-03-15',
            'position' => 'Department Manager',
            'department_id' => $hrDepartment->id,
            'salary' => 65000.00,
            'status' => 'active',
        ]);

        // 7. Create Regular Employees
        $employee1 = User::create([
            'name' => 'Sarah Johnson',
            'email' => 'sarah@gmail.com',
            'password' => Hash::make('password'),
        ]);
        $employee1->assignRole($employeeRole);
        $employee1->employee()->create([
            'employee_id' => 'EMP003',
            'phone' => '+1234567895',
            'address' => '789 Employee Road',
            'date_of_birth' => '1992-08-20',
            'hire_date' => '2022-06-01',
            'position' => 'Software Developer',
            'department_id' => $itDepartment->id,
            'salary' => 55000.00,
            'status' => 'active',
        ]);

        $employee2 = User::create([
            'name' => 'Alice Smith',
            'email' => 'alice@gmail.com',
            'password' => Hash::make('password'),
        ]);
        $employee2->assignRole($employeeRole);
        $employee2->employee()->create([
            'employee_id' => 'EMP004',
            'phone' => '+1234567896',
            'address' => '321 Finance Lane',
            'date_of_birth' => '1995-03-10',
            'hire_date' => '2023-01-10',
            'position' => 'Accountant',
            'department_id' => $financeDepartment->id,
            'salary' => 50000.00,
            'status' => 'active',
        ]);

        $employee3 = User::create([
            'name' => 'Bob Williams',
            'email' => 'bob@gmail.com',
            'password' => Hash::make('password'),
        ]);
        $employee3->assignRole($employeeRole);
        $employee3->employee()->create([
            'employee_id' => 'EMP005',
            'phone' => '+1234567897',
            'address' => '654 Sales Boulevard',
            'date_of_birth' => '1993-11-25',
            'hire_date' => '2022-09-15',
            'position' => 'Sales Representative',
            'department_id' => $salesDepartment->id,
            'salary' => 48000.00,
            'status' => 'active',
        ]);

        // 8. Seed Hospital Setup Data
        $this->call([
            RoomTypeSeeder::class,
            RoomSeeder::class,
            BedSeeder::class,
            SupplierSeeder::class,
            MedicineCategorySeeder::class,
            MedicineSeeder::class,
            PatientSeeder::class,
            ServiceSeeder::class,
            InsuranceSeeder::class,
            HospitalDataSeeder::class,
        ]);

        // 9. Seed Hospital Modules
        $this->call([
            DoctorScheduleSeeder::class,
            PatientQueueSeeder::class,
            OpdRecordSeeder::class,
            OperationTheaterSeeder::class,
        ]);

        // 10. Seed permissions and hospital roles
        $this->call([
            PermissionSeeder::class,
            HospitalRolesSeeder::class,
        ]);
    }
}
