import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface MedicalRecord {
    id: number;
    patient: { name: string };
    doctor: { name: string };
    record_type: string;
    record_date: string;
    chief_complaint: string | null;
    diagnosis: string | null;
    notes: string | null;
}

interface Props {
    record: MedicalRecord;
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function MedicalRecordsShow({ record }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Medical Records', href: '/medical-records' },
        { title: `Record #${record.id}`, href: `/medical-records/${record.id}` },
    ];

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            consultation: 'bg-blue-100 text-blue-800',
            procedure: 'bg-purple-100 text-purple-800',
            follow_up: 'bg-green-100 text-green-800',
            emergency: 'bg-red-100 text-red-800',
            surgery: 'bg-orange-100 text-orange-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Medical Record #${record.id}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Medical Record #{record.id}</h1>
                        <p className="text-muted-foreground text-sm">{record.record_date}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('medical-records.edit', record.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('medical-records.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Badge className={getTypeColor(record.record_type)}>{record.record_type}</Badge>

                <Card>
                    <CardHeader>
                        <CardTitle>Record Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="Patient" value={record.patient?.name} />
                        <Info label="Doctor" value={record.doctor?.name} />
                        <Info label="Record Type" value={record.record_type} />
                        <Info label="Record Date" value={record.record_date} />
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground text-sm">Chief Complaint</p>
                            <p className="font-medium">{record.chief_complaint || '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground text-sm">Diagnosis</p>
                            <p className="font-medium">{record.diagnosis || '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground text-sm">Notes</p>
                            <p className="font-medium">{record.notes || '-'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
