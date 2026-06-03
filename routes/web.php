<?php


use App\Http\Controllers\Auth\SocialLoginController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\CashDashboardController;
use App\Http\Controllers\HospitalDashboardController;

use App\Http\Controllers\CurrencyController;

use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\RoomTypeController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\BedController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\MedicineCategoryController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\PurchaseOrderController;

// Hospital Modules
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\InsuranceController;
use App\Http\Controllers\LabTestController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\VitalController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\IpdRecordController;
use App\Http\Controllers\DoctorScheduleController;
use App\Http\Controllers\PatientQueueController;
use App\Http\Controllers\OpdRecordController;
use App\Http\Controllers\OperationTheaterController;
use App\Http\Controllers\SurgeryScheduleController;

use App\Http\Middleware\AdminOnly;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/offline', function () {
    return view('offline');
});

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');
Route::get('auth/google', [SocialLoginController::class, 'redirectToGoogle'])->name('google.login');
Route::get('auth/google/callback', [SocialLoginController::class, 'handleGoogleCallback']);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard',  [HospitalDashboardController::class, 'index'])->name('dashboard');
    
    // Dashboard API endpoints
    Route::get('api/dashboard/stats', [HospitalDashboardController::class, 'apiStats']);
    Route::get('api/dashboard/charts', [HospitalDashboardController::class, 'apiCharts']);
    Route::get('api/dashboard/recent-patients', [HospitalDashboardController::class, 'apiRecentPatients']);
    Route::get('api/dashboard/upcoming-appointments', [HospitalDashboardController::class, 'apiUpcomingAppointments']);
    Route::get('api/dashboard/ipd-patients', [HospitalDashboardController::class, 'apiIpdPatients']);
    Route::get('api/dashboard/low-stock', [HospitalDashboardController::class, 'apiLowStockMedicines']);
    Route::get('api/dashboard/recent-billings', [HospitalDashboardController::class, 'apiRecentBillings']);
    
    Route::middleware([AdminOnly::class])->group(function () {
        Route::get('cash-dashboard', [CashDashboardController::class, 'index'])->name('cash.dashboard');
        Route::get('employee-dashboard', [CashDashboardController::class, 'employeeDashboard'])->name('cash.employeeDashboard');
        Route::post('cash-ledgers/income', [CashDashboardController::class, 'storeIncome'])->name('cash-ledgers.income.store');
        Route::post('cash-ledgers/outcome', [CashDashboardController::class, 'storeOutcome'])->name('cash-ledgers.outcome.store');
        Route::resource('users', UserController::class);
        Route::resource('patients', PatientController::class);
        Route::resource('roles', RoleController::class);
        Route::resource('permissions', PermissionController::class);
        Route::resource('departments', DepartmentController::class);
        Route::resource('branches', BranchController::class);
        Route::resource('locations', LocationController::class);
        Route::resource('currencies', CurrencyController::class);
        Route::resource('employees', EmployeeController::class);

        // Hospital ERP - Master Setup
        Route::resource('room_types', RoomTypeController::class);
        Route::resource('rooms', RoomController::class);
        Route::resource('beds', BedController::class);

        // Pharmacy - Suppliers
        Route::resource('suppliers', SupplierController::class);
        Route::post('suppliers/{supplier}/toggle-status', [SupplierController::class, 'toggleStatus'])->name('suppliers.toggle-status');

        // Pharmacy - Medicine Categories
        Route::resource('medicine-categories', MedicineCategoryController::class);
        Route::post('medicine-categories/{medicineCategory}/toggle-status', [MedicineCategoryController::class, 'toggleStatus'])->name('medicine-categories.toggle-status');

        // Pharmacy - Medicines
        Route::resource('medicines', MedicineController::class);
        Route::post('medicines/{medicine}/toggle-status', [MedicineController::class, 'toggleStatus'])->name('medicines.toggle-status');

        // Pharmacy - Inventory
        Route::resource('inventory', InventoryController::class);
        Route::post('inventory/{inventory}/adjust', [InventoryController::class, 'adjustStock'])->name('inventory.adjust');
        Route::post('inventory/{inventory}/damage', [InventoryController::class, 'markDamaged'])->name('inventory.damage');

        // Pharmacy - Stock Movements
        Route::resource('stock-movements', StockMovementController::class);
        Route::get('api/low-stock', [StockMovementController::class, 'getLowStockMedicines'])->name('api.low-stock');
        Route::get('api/expiring-stock', [StockMovementController::class, 'getExpiringStock'])->name('api.expiring-stock');
        Route::get('api/inventory-summary', [StockMovementController::class, 'getInventorySummary'])->name('api.inventory-summary');

        // Pharmacy - Purchase Orders
        Route::resource('purchase-orders', PurchaseOrderController::class);
        Route::post('purchase-orders/{purchaseOrder}/status', [PurchaseOrderController::class, 'updateStatus'])->name('purchase-orders.status');
        Route::post('purchase-orders/{purchaseOrder}/receive', [PurchaseOrderController::class, 'receiveStock'])->name('purchase-orders.receive');

        // Hospital - Appointments
        Route::resource('appointments', AppointmentController::class);
        Route::post('appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])->name('appointments.status');

        // Hospital - Services
        Route::resource('services', ServiceController::class);
        Route::post('services/{service}/toggle-status', [ServiceController::class, 'toggleStatus'])->name('services.toggle-status');

        // Hospital - Billing
        Route::resource('billings', BillingController::class);
        Route::post('billings/{billing}/payment', [BillingController::class, 'payment'])->name('billings.payment');

        // Hospital - Insurance
        Route::resource('insurances', InsuranceController::class);

        // Hospital - Lab Tests
        Route::resource('lab-tests', LabTestController::class);

        // Hospital - Prescriptions
        Route::resource('prescriptions', PrescriptionController::class);

        // Hospital - Vitals
        Route::resource('vitals', VitalController::class);

        // Hospital - Medical Records
        Route::resource('medical-records', MedicalRecordController::class);

        // Hospital - IPD Records
        Route::resource('ipd-records', IpdRecordController::class);
        Route::post('ipd-records/{ipdRecord}/discharge', [IpdRecordController::class, 'discharge'])->name('ipd-records.discharge');

        // Hospital - Doctor Schedules
        Route::resource('doctor-schedules', DoctorScheduleController::class);
        Route::post('doctor-schedules/{doctorSchedule}/toggle', [DoctorScheduleController::class, 'toggleStatus'])->name('doctor-schedules.toggle');
        Route::get('api/doctor-schedules/{doctorSchedule}/slots', [DoctorScheduleController::class, 'getAvailableSlots'])->name('api.doctor-schedules.slots');

        // Hospital - Patient Queue
        Route::resource('patient-queues', PatientQueueController::class);
        Route::post('patient-queues/{patientQueue}/call', [PatientQueueController::class, 'callPatient'])->name('patient-queues.call');
        Route::post('patient-queues/{patientQueue}/start', [PatientQueueController::class, 'startConsultation'])->name('patient-queues.start');
        Route::post('patient-queues/{patientQueue}/complete', [PatientQueueController::class, 'completeConsultation'])->name('patient-queues.complete');
        Route::post('patient-queues/{patientQueue}/no-show', [PatientQueueController::class, 'markNoShow'])->name('patient-queues.no-show');
        Route::post('patient-queues/{patientQueue}/cancel', [PatientQueueController::class, 'cancelQueue'])->name('patient-queues.cancel');
        Route::get('api/patient-queues/waiting-count', [PatientQueueController::class, 'getWaitingCount'])->name('api.patient-queues.waiting');
        Route::get('api/patient-queues/next', [PatientQueueController::class, 'getNextInQueue'])->name('api.patient-queues.next');

        // Hospital - OPD Records
        Route::resource('opd-records', OpdRecordController::class);

        // Hospital - Operation Theater
        Route::resource('operation-theaters', OperationTheaterController::class);
        Route::post('operation-theaters/{operationTheater}/toggle', [OperationTheaterController::class, 'toggleAvailability'])->name('operation-theaters.toggle');

        // Hospital - Surgery Schedules
        Route::resource('surgery-schedules', SurgeryScheduleController::class);
        Route::post('surgery-schedules/{surgerySchedule}/start', [SurgeryScheduleController::class, 'startSurgery'])->name('surgery-schedules.start');
        Route::post('surgery-schedules/{surgerySchedule}/complete', [SurgeryScheduleController::class, 'completeSurgery'])->name('surgery-schedules.complete');
        Route::post('surgery-schedules/{surgerySchedule}/cancel', [SurgeryScheduleController::class, 'cancelSurgery'])->name('surgery-schedules.cancel');

        Route::get('admin/dashboard', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('admin.dashboard');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
