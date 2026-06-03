import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Prescription {
    id: number;
    patient: { name: string };
    doctor: { name: string };
    prescription_date: string;
    diagnosis: string | null;
    notes: string | null;
    status: string;
}

interface Props {
    prescription: Prescription;
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function PrescriptionsShow({ prescription }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Prescriptions', href: '/prescriptions' },
        { title: `Prescription #${prescription.id}`, href: `/prescriptions/${prescription.id}` },
    ];

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800',
            active: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Prescription #${prescription.id}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Prescription #{prescription.id}</h1>
                        <p className="text-muted-foreground text-sm">{prescription.prescription_date}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('prescriptions.edit', prescription.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('prescriptions.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Badge className={getStatusColor(prescription.status)}>{prescription.status}</Badge>

                <Card>
                    <CardHeader>
                        <CardTitle>Prescription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="Patient" value={prescription.patient?.name} />
                        <Info label="Doctor" value={prescription.doctor?.name} />
                        <Info label="Prescription Date" value={prescription.prescription_date} />
                        <Info label="Diagnosis" value={prescription.diagnosis} />
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground text-sm">Notes</p>
                            <p className="font-medium">{prescription.notes || '-'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
