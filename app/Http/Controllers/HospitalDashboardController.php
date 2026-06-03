<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Billing;
use App\Models\IpdRecord;
use App\Models\Bed;
use App\Models\Room;
use App\Models\Medicine;
use App\Models\InventoryStock;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Service;
use App\Models\LabTest;
use App\Models\Prescription;
use App\Models\MedicalRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HospitalDashboardController extends Controller
{
    public function index(Request $request)
    {
        $stats = $this->getStats();
        $charts = $this->getCharts($request);
        $recentPatients = $this->getRecentPatients();
        $upcomingAppointments = $this->getUpcomingAppointments();
        $ipdPatients = $this->getIpdPatients();
        $lowStockMedicines = $this->getLowStockMedicines();
        $recentBillings = $this->getRecentBillings();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'charts' => $charts,
            'recentPatients' => $recentPatients,
            'upcomingAppointments' => $upcomingAppointments,
            'ipdPatients' => $ipdPatients,
            'lowStockMedicines' => $lowStockMedicines,
            'recentBillings' => $recentBillings,
        ]);
    }

    protected function getStats(): array
    {
        $today = now()->toDateString();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        return [
            'totalPatients' => Patient::count(),
            'todayPatients' => Patient::whereDate('registration_date', $today)->count(),
            'totalAppointments' => Appointment::count(),
            'todayAppointments' => Appointment::whereDate('appointment_date', $today)->count(),
            'pendingAppointments' => Appointment::where('status', 'pending')->count(),
            'completedAppointments' => Appointment::where('status', 'completed')->count(),
            'totalIpdPatients' => IpdRecord::where('status', 'admitted')->count(),
            'availableBeds' => Bed::where('status', 'available')->count(),
            'occupiedBeds' => Bed::where('status', 'occupied')->count(),
            'totalRooms' => Room::count(),
            'totalEmployees' => Employee::count(),
            'activeEmployees' => Employee::where('status', 'active')->count(),
            'totalDoctors' => Employee::where('position', 'Doctor')->count(),
            'departments' => Department::count(),
            'totalMedicines' => Medicine::count(),
            'lowStockMedicines' => Medicine::whereHas('inventoryStocks', function ($q) {
                $q->where('quantity', '<=', DB::raw('medicines.reorder_level'));
            })->count(),
            'totalServices' => Service::count(),
            'activeServices' => Service::where('status', 'active')->count(),
            'totalLabTests' => LabTest::count(),
            'pendingLabTests' => LabTest::where('status', 'pending')->count(),
            'completedLabTests' => LabTest::where('status', 'completed')->count(),
            'totalPrescriptions' => Prescription::count(),
            'totalBillings' => Billing::count(),
            'todayRevenue' => Billing::whereDate('billing_date', $today)->sum('total'),
            'monthlyRevenue' => Billing::whereDate('billing_date', '>=', $thisMonth)->sum('total'),
            'pendingPayments' => Billing::where('status', 'pending')->sum('total'),
            'paidBillings' => Billing::where('status', 'paid')->sum('total'),
        ];
    }

    protected function getCharts(Request $request): array
    {
        $months = 6;
        $chartData = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthLabel = $date->format('M');
            $startOfMonth = $date->startOfMonth()->toDateString();
            $endOfMonth = $date->endOfMonth()->toDateString();

            $chartData['appointments'][] = [
                'month' => $monthLabel,
                'count' => Appointment::whereBetween('appointment_date', [$startOfMonth, $endOfMonth])->count(),
            ];

            $chartData['patients'][] = [
                'month' => $monthLabel,
                'count' => Patient::whereBetween('registration_date', [$startOfMonth, $endOfMonth])->count(),
            ];

            $chartData['revenue'][] = [
                'month' => $monthLabel,
                'amount' => Billing::whereBetween('billing_date', [$startOfMonth, $endOfMonth])->sum('total'),
            ];

            $chartData['ipd'][] = [
                'month' => $monthLabel,
                'count' => IpdRecord::whereBetween('admission_date', [$startOfMonth, $endOfMonth])->count(),
            ];
        }

        $chartData['departmentStats'] = Department::withCount('employees')
            ->get()
            ->map(fn($d) => [
                'name' => $d->name,
                'employees' => $d->employees_count,
            ])
            ->toArray();

        $chartData['appointmentStatus'] = Appointment::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($a) => [
                'status' => $a->status,
                'count' => $a->count,
            ])
            ->toArray();

        $chartData['bedOccupancy'] = [
            'available' => Bed::where('status', 'available')->count(),
            'occupied' => Bed::where('status', 'occupied')->count(),
            'maintenance' => Bed::where('status', 'maintenance')->count(),
        ];

        return $chartData;
    }

    protected function getRecentPatients()
    {
        return Patient::latest()
            ->take(10)
            ->get()
            ->map(fn($p) => [
                'id' => $p->patient_id,
                'name' => $p->name,
                'email' => $p->email,
                'phone' => $p->phone ?? null,
                'registration_date' => $p->registration_date,
                'gender' => $p->gender,
            ]);
    }

    protected function getUpcomingAppointments()
    {
        return Appointment::with(['patient', 'doctor', 'department'])
            ->where('status', 'confirmed')
            ->whereDate('appointment_date', '>=', now()->toDateString())
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->take(10)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'patient_name' => $a->patient->name ?? 'N/A',
                'doctor_name' => $a->doctor->name ?? 'N/A',
                'department_name' => $a->department->name ?? 'N/A',
                'appointment_date' => $a->appointment_date,
                'appointment_time' => $a->appointment_time,
                'type' => $a->type,
                'reason' => $a->reason,
            ]);
    }

    protected function getIpdPatients()
    {
        return IpdRecord::with(['patient', 'bed', 'attendingDoctor'])
            ->where('status', 'admitted')
            ->orderBy('admission_date', 'desc')
            ->take(10)
            ->get()
            ->map(fn($ipd) => [
                'id' => $ipd->id,
                'patient_name' => $ipd->patient->name ?? 'N/A',
                'bed_number' => $ipd->bed->bed_number ?? 'N/A',
                'room_number' => $ipd->bed->room->room_number ?? 'N/A',
                'doctor_name' => $ipd->attendingDoctor->name ?? 'N/A',
                'admission_date' => $ipd->admission_date,
                'diagnosis' => $ipd->diagnosis,
            ]);
    }

    protected function getLowStockMedicines()
    {
        return Medicine::with('inventoryStocks')
            ->get()
            ->filter(fn($m) => $m->total_stock <= $m->reorder_level)
            ->take(10)
            ->map(fn($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'medicine_code' => $m->medicine_code,
                'total_stock' => $m->total_stock,
                'reorder_level' => $m->reorder_level,
                'category' => $m->category->name ?? 'N/A',
            ])
            ->values();
    }

    protected function getRecentBillings()
    {
        return Billing::with('patient')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($b) => [
                'id' => $b->id,
                'invoice_number' => $b->invoice_number,
                'patient_name' => $b->patient->name ?? 'N/A',
                'total' => $b->total,
                'amount_paid' => $b->amount_paid,
                'status' => $b->status,
                'billing_date' => $b->billing_date,
            ]);
    }

    public function apiStats()
    {
        return response()->json($this->getStats());
    }

    public function apiCharts(Request $request)
    {
        return response()->json($this->getCharts($request));
    }

    public function apiRecentPatients()
    {
        return response()->json($this->getRecentPatients());
    }

    public function apiUpcomingAppointments()
    {
        return response()->json($this->getUpcomingAppointments());
    }

    public function apiIpdPatients()
    {
        return response()->json($this->getIpdPatients());
    }

    public function apiLowStockMedicines()
    {
        return response()->json($this->getLowStockMedicines());
    }

    public function apiRecentBillings()
    {
        return response()->json($this->getRecentBillings());
    }
}
