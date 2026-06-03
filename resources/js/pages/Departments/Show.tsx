import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Department {
    id: number;
    name: string;
    description: string | null;
    employees_count: number;
}

interface Props {
    department: Department;
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function DepartmentsShow({ department }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Departments', href: '/departments' },
        { title: department.name, href: `/departments/${department.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Department: ${department.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{department.name}</h1>
                        <p className="text-muted-foreground text-sm">Department Details</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('departments.edit', department.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('departments.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Department Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="ID" value={department.id} />
                        <Info label="Name" value={department.name} />
                        <Info label="Employees Count" value={department.employees_count} />
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground text-sm">Description</p>
                            <p className="font-medium">{department.description || '-'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
