import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface IpdRecord {
    id: number;
    patient: { name: string };
    bed: { bed_number: string; room: { room_number: string; room_type: { name: string } } };
    admission_date: string;
    discharge_date: string | null;
    diagnosis: string;
    notes: string | null;
    status: string;
}

interface Props {
    ipdRecord: IpdRecord;
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function IpdRecordsShow({ ipdRecord }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'IPD Records', href: '/ipd-records' },
        { title: `Record #${ipdRecord.id}`, href: `/ipd-records/${ipdRecord.id}` },
    ];

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            admitted: 'bg-blue-100 text-blue-800',
            discharged: 'bg-green-100 text-green-800',
            transferred: 'bg-purple-100 text-purple-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`IPD Record #${ipdRecord.id}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">IPD Record #{ipdRecord.id}</h1>
                        <p className="text-muted-foreground text-sm">Patient: {ipdRecord.patient?.name}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('ipd-records.edit', ipdRecord.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('ipd-records.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Badge className={getStatusColor(ipdRecord.status)}>{ipdRecord.status}</Badge>

                <Card>
                    <CardHeader>
                        <CardTitle>Admission Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="Patient" value={ipdRecord.patient?.name} />
                        <Info label="Bed" value={ipdRecord.bed?.bed_number} />
                        <Info label="Room" value={ipdRecord.bed?.room?.room_number} />
                        <Info label="Room Type" value={ipdRecord.bed?.room?.room_type?.name} />
                        <Info label="Admission Date" value={ipdRecord.admission_date} />
                        <Info label="Discharge Date" value={ipdRecord.discharge_date} />
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground text-sm">Diagnosis</p>
                            <p className="font-medium">{ipdRecord.diagnosis}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground text-sm">Notes</p>
                            <p className="font-medium">{ipdRecord.notes || '-'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
