import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { AlertCircle, Bed, Calendar, DollarSign, FileText, FlaskConical, Pill, Stethoscope, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts';

interface DashboardProps {
    stats: {
        totalPatients: number;
        todayPatients: number;
        totalAppointments: number;
        todayAppointments: number;
        pendingAppointments: number;
        completedAppointments: number;
        totalIpdPatients: number;
        availableBeds: number;
        occupiedBeds: number;
        totalRooms: number;
        totalEmployees: number;
        activeEmployees: number;
        totalDoctors: number;
        departments: number;
        totalMedicines: number;
        lowStockMedicines: number;
        totalServices: number;
        activeServices: number;
        totalLabTests: number;
        pendingLabTests: number;
        completedLabTests: number;
        totalPrescriptions: number;
        totalBillings: number;
        todayRevenue: number;
        monthlyRevenue: number;
        pendingPayments: number;
        paidBillings: number;
    };
    charts: {
        appointments: { month: string; count: number }[];
        patients: { month: string; count: number }[];
        revenue: { month: string; amount: number }[];
        ipd: { month: string; count: number }[];
        departmentStats: { name: string; employees: number }[];
        appointmentStatus: { status: string; count: number }[];
        bedOccupancy: { available: number; occupied: number; maintenance: number };
    };
    recentPatients: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        registration_date: string;
        gender: string;
    }[];
    upcomingAppointments: {
        id: number;
        patient_name: string;
        doctor_name: string;
        department_name: string;
        appointment_date: string;
        appointment_time: string;
        type: string;
        reason: string;
    }[];
    ipdPatients: {
        id: number;
        patient_name: string;
        bed_number: string;
        room_number: string;
        doctor_name: string;
        admission_date: string;
        diagnosis: string;
    }[];
    lowStockMedicines: {
        id: number;
        name: string;
        medicine_code: string;
        total_stock: number;
        reorder_level: number;
        category: string;
    }[];
    recentBillings: {
        id: number;
        invoice_number: string;
        patient_name: string;
        total: number;
        amount_paid: number;
        status: string;
        billing_date: string;
    }[];
}

const chartConfig = {
    appointments: { label: 'Appointments', color: '#2563eb' },
    patients: { label: 'Patients', color: '#059669' },
    revenue: { label: 'Revenue', color: '#7c3aed' },
    ipd: { label: 'IPD', color: '#dc2626' },
};

const PRIMARY = '#2563eb';
const SUCCESS = '#059669';
const PURPLE = '#7c3aed';
const RED = '#dc2626';
const GRAY = '#6b7280';

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export default function Dashboard({
    stats,
    charts,
    recentPatients,
    upcomingAppointments,
    ipdPatients,
    lowStockMedicines,
    recentBillings,
}: DashboardProps) {
    const bedOccupancyData = [
        { name: 'Available', value: charts.bedOccupancy.available, color: SUCCESS },
        { name: 'Occupied', value: charts.bedOccupancy.occupied, color: PRIMARY },
        { name: 'Maintenance', value: charts.bedOccupancy.maintenance, color: GRAY },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />

            <div className="space-y-6 p-4 lg:p-6">
                {/* Stats Cards Row 1 */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-muted-foreground text-xs font-medium">Total Patients</CardTitle>
                                <div className="text-2xl font-bold lg:text-3xl">{stats.totalPatients.toLocaleString()}</div>
                            </div>
                            <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                                <Users className="text-primary h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-muted-foreground text-xs">+{stats.todayPatients} today</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-muted-foreground text-xs font-medium">Today Appointments</CardTitle>
                                <div className="text-2xl font-bold lg:text-3xl">{stats.todayAppointments}</div>
                            </div>
                            <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                                <Calendar className="text-primary h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex gap-2 text-xs">
                                <span className="text-primary font-medium">{stats.pendingAppointments} pending</span>
                                <span className="text-muted-foreground">-</span>
                                <span className="text-muted-foreground">{stats.completedAppointments} done</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-muted-foreground text-xs font-medium">IPD Patients</CardTitle>
                                <div className="text-2xl font-bold lg:text-3xl">{stats.totalIpdPatients}</div>
                            </div>
                            <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                                <Bed className="text-primary h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-muted-foreground text-xs">{stats.availableBeds} beds available</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-muted-foreground text-xs font-medium">Today Revenue</CardTitle>
                                <div className="truncate text-xl font-bold lg:text-2xl">{formatCurrency(stats.todayRevenue)}</div>
                            </div>
                            <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                                <DollarSign className="text-primary h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-muted-foreground text-xs">Monthly: {formatCurrency(stats.monthlyRevenue)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Cards Row 2 */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium">Employees</CardTitle>
                            <Stethoscope className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-xl font-bold lg:text-2xl">{stats.totalEmployees}</div>
                            <p className="text-muted-foreground text-xs">{stats.totalDoctors} doctors</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium">Medicines</CardTitle>
                            <Pill className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-xl font-bold lg:text-2xl">{stats.totalMedicines}</div>
                            <p className="text-muted-foreground text-xs">{stats.lowStockMedicines} low stock</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium">Lab Tests</CardTitle>
                            <FlaskConical className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-xl font-bold lg:text-2xl">{stats.totalLabTests}</div>
                            <p className="text-muted-foreground text-xs">{stats.pendingLabTests} pending</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium">Billings</CardTitle>
                            <FileText className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-xl font-bold lg:text-2xl">{stats.totalBillings}</div>
                            <p className="text-muted-foreground text-xs">Paid: {formatCurrency(stats.paidBillings)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row - Full Width */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Revenue Chart - Wider */}
                    <Card className="border-0 shadow-sm lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Revenue Overview</CardTitle>
                            <p className="text-muted-foreground text-xs">Monthly revenue trend</p>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ChartContainer config={chartConfig} className="h-[240px] w-full">
                                <LineChart data={charts.revenue} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 10 }}
                                        className="text-muted-foreground"
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        width={55}
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(v) => `$${v >= 1000 ? `${v / 1000}k` : v}`}
                                        className="text-muted-foreground"
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="amount"
                                        stroke={PURPLE}
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4, fill: PURPLE }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Bed Occupancy */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Bed Occupancy</CardTitle>
                            <p className="text-muted-foreground text-xs">Current status</p>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ChartContainer config={chartConfig} className="h-[180px] w-full">
                                <PieChart>
                                    <Pie data={bedOccupancyData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                        {bedOccupancyData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip />
                                </PieChart>
                            </ChartContainer>
                            <div className="mt-2 flex justify-center gap-4 text-xs">
                                {bedOccupancyData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-muted-foreground">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Appointments & Patients Charts */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Monthly Appointments */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Appointments</CardTitle>
                            <p className="text-muted-foreground text-xs">Monthly count</p>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                <BarChart data={charts.appointments} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                    <YAxis tickLine={false} axisLine={false} width={35} tick={{ fontSize: 10 }} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" fill={SUCCESS} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Monthly New Patients */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">New Patients</CardTitle>
                            <p className="text-muted-foreground text-xs">Monthly registrations</p>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                <AreaChart data={charts.patients} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={PRIMARY} stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                    <YAxis tickLine={false} axisLine={false} width={35} tick={{ fontSize: 10 }} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area type="monotone" dataKey="count" stroke={PRIMARY} fill="url(#colorPatients)" strokeWidth={2} />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* IPD Admissions */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">IPD Admissions</CardTitle>
                            <p className="text-muted-foreground text-xs">Monthly admissions</p>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                <BarChart data={charts.ipd} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                    <YAxis tickLine={false} axisLine={false} width={35} tick={{ fontSize: 10 }} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" fill={RED} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Tables Row */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Recent Patients */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Recent Patients</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {recentPatients.slice(0, 5).map((patient) => (
                                    <div key={patient.id} className="flex items-start justify-between gap-2 border-b pb-2.5 last:border-0">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{patient.name}</p>
                                            <p className="text-muted-foreground truncate text-xs">{patient.phone || patient.email}</p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <p className="text-muted-foreground text-[10px]">
                                                {new Date(patient.registration_date).toLocaleDateString()}
                                            </p>
                                            <span
                                                className={cn(
                                                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                    patient.gender === 'Male' ? 'bg-primary/10 text-primary' : 'bg-pink-100 text-pink-700',
                                                )}
                                            >
                                                {patient.gender}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {recentPatients.length === 0 && <p className="text-muted-foreground py-4 text-center text-xs">No recent patients</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Appointments */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Upcoming Appointments</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {upcomingAppointments.slice(0, 5).map((apt) => (
                                    <div key={apt.id} className="flex items-start justify-between gap-2 border-b pb-2.5 last:border-0">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{apt.patient_name}</p>
                                            <p className="text-muted-foreground truncate text-xs">{apt.doctor_name}</p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <p className="text-primary text-[10px] font-medium">
                                                {new Date(apt.appointment_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-muted-foreground text-[10px]">{apt.appointment_time}</p>
                                        </div>
                                    </div>
                                ))}
                                {upcomingAppointments.length === 0 && (
                                    <p className="text-muted-foreground py-4 text-center text-xs">No upcoming appointments</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current IPD Patients */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">IPD Patients</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {ipdPatients.slice(0, 5).map((ipd) => (
                                    <div key={ipd.id} className="flex items-start justify-between gap-2 border-b pb-2.5 last:border-0">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{ipd.patient_name}</p>
                                            <p className="text-muted-foreground text-xs">Bed {ipd.bed_number}</p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <p className="text-muted-foreground text-[10px]">{new Date(ipd.admission_date).toLocaleDateString()}</p>
                                            <span className="bg-primary/10 text-primary inline-flex max-w-[80px] items-center truncate rounded-full px-2 py-0.5 text-[10px] font-medium">
                                                {ipd.diagnosis || 'Admitted'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {ipdPatients.length === 0 && <p className="text-muted-foreground py-4 text-center text-xs">No IPD patients</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Row */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Low Stock Medicines */}
                    <Card className={cn('border-0 shadow-sm', lowStockMedicines.length > 0 && 'border-primary/20 bg-primary/5 border')}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                <AlertCircle className={cn('h-4 w-4', lowStockMedicines.length > 0 ? 'text-primary' : 'text-muted-foreground')} />
                                <CardTitle className="text-sm font-semibold">Low Stock Medicines</CardTitle>
                            </div>
                            {lowStockMedicines.length > 0 && (
                                <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium">
                                    {lowStockMedicines.length} items
                                </span>
                            )}
                        </CardHeader>
                        <CardContent className="pt-0">
                            {lowStockMedicines.length > 0 ? (
                                <div className="space-y-3">
                                    {lowStockMedicines.slice(0, 5).map((medicine) => (
                                        <div key={medicine.id} className="flex items-start justify-between gap-2 border-b pb-2 last:border-0">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{medicine.name}</p>
                                                <p className="text-muted-foreground text-xs">{medicine.medicine_code}</p>
                                            </div>
                                            <div className="flex shrink-0 flex-col items-end gap-1">
                                                <span className="text-primary text-sm font-semibold">{medicine.total_stock}</span>
                                                <p className="text-muted-foreground text-[10px]">Min: {medicine.reorder_level}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground py-4 text-center text-xs">All medicines well stocked</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Billings */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Recent Billings</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {recentBillings.slice(0, 5).map((billing) => (
                                    <div key={billing.id} className="flex items-start justify-between gap-2 border-b pb-2.5 last:border-0">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{billing.patient_name}</p>
                                            <p className="text-muted-foreground text-xs">{billing.invoice_number}</p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <p className="text-sm font-semibold">{formatCurrency(billing.total)}</p>
                                            <span
                                                className={cn(
                                                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                    billing.status === 'paid' && 'bg-primary/10 text-primary',
                                                    billing.status === 'pending' && 'bg-amber-100 text-amber-700',
                                                    billing.status === 'overdue' && 'bg-red-100 text-red-700',
                                                    !['paid', 'pending', 'overdue'].includes(billing.status) && 'bg-muted text-muted-foreground',
                                                )}
                                            >
                                                {billing.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {recentBillings.length === 0 && <p className="text-muted-foreground py-4 text-center text-xs">No recent billings</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
