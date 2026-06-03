import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Department {
    id: number;
    name: string;
}

interface Employee {
    id: number;
    employee_id: string;
    user_id: number;
    user: User;
    phone: string | null;
    address: string | null;
    date_of_birth: string | null;
    hire_date: string;
    position: string;
    department_id: number;
    department: Department;
    salary: string;
    status: string;
}

interface Props {
    employee: Employee;
}

function Info({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function EmployeeShow({ employee }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'HR', href: '/hr' },
        { title: 'Employees', href: '/employees' },
        { title: employee.user?.name || 'Employee', href: `/employees/${employee.id}` },
    ];

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            inactive: 'secondary',
            on_leave: 'outline',
            suspended: 'destructive',
        };
        return <Badge variant={variants[status] || 'secondary'}>{status.replace('_', ' ')}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Employee: ${employee.user?.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => router.visit(route('employees.index'))}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">{employee.user?.name || 'Employee'}</h1>
                        {getStatusBadge(employee.status)}
                    </div>
                    <Link href={route('employees.edit', employee.id)}>
                        <Button variant="outline" className="gap-2">
                            <Pencil className="h-4 w-4" /> Edit
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                        <Info label="Employee ID" value={employee.employee_id} />
                        <Info label="Email" value={employee.user?.email} />
                        <Info label="Phone" value={employee.phone} />
                        <Info label="Address" value={employee.address} />
                        <Info label="Date of Birth" value={employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : '-'} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Employment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                        <Info label="Position" value={employee.position} />
                        <Info label="Department" value={employee.department?.name} />
                        <Info label="Hire Date" value={new Date(employee.hire_date).toLocaleDateString()} />
                        <Info label="Salary" value={employee.salary ? `$${parseFloat(employee.salary).toFixed(2)}` : '-'} />
                        <Info label="Status" value={employee.status.replace('_', ' ')} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
