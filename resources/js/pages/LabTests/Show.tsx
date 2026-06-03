import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface LabTest {
    id: number;
    patient: { name: string };
    doctor: { name: string };
    test_name: string;
    test_code: string | null;
    category: string | null;
    ordered_date: string;
    result_date: string | null;
    result: string | null;
    normal_range: string | null;
    unit: string | null;
    status: string;
}

interface Props {
    labTest: LabTest;
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function LabTestsShow({ labTest }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Lab Tests', href: '/lab-tests' },
        { title: labTest.test_name, href: `/lab-tests/${labTest.id}` },
    ];

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            ordered: 'bg-blue-100 text-blue-800',
            processing: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Lab Test: ${labTest.test_name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{labTest.test_name}</h1>
                        <p className="text-muted-foreground text-sm">{labTest.test_code || 'No code'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('lab-tests.edit', labTest.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('lab-tests.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Badge className={getStatusColor(labTest.status)}>{labTest.status}</Badge>

                <Card>
                    <CardHeader>
                        <CardTitle>Test Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="Patient" value={labTest.patient?.name} />
                        <Info label="Ordered By" value={labTest.doctor?.name} />
                        <Info label="Test Name" value={labTest.test_name} />
                        <Info label="Test Code" value={labTest.test_code} />
                        <Info label="Category" value={labTest.category} />
                        <Info label="Ordered Date" value={labTest.ordered_date} />
                        <Info label="Result Date" value={labTest.result_date} />
                        <Info label="Result" value={labTest.result} />
                        <Info label="Normal Range" value={labTest.normal_range} />
                        <Info label="Unit" value={labTest.unit} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
