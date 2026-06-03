import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Room {
    id: number;
    room_number: string;
}

interface Employee {
    id: number;
    employee_id: string | null;
}

interface Bed {
    id: number;
    room_id: number;
    bed_number: string;
    bed_type: string;
    has_ventilator: boolean;
    has_monitor: boolean;
    has_suction: boolean;
    has_oxygen: boolean;
    status: string;
    is_isolated: boolean;
    current_patient_id: number | null;
    current_encounter_id: number | null;
    occupied_since: string | null;
    expected_vacate_date: string | null;
    is_active: boolean;
    last_cleaned_date: string | null;
    last_cleaned_by: number | null;
    notes: string | null;
    room?: Room;
    lastCleaner?: Employee;
}

interface Props {
    bed: Bed;
}

function Info({ label, value }: { label: string; value?: string | number | boolean | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

function BooleanBadge({ value }: { value: boolean }) {
    return value ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge>;
}

export default function BedsShow({ bed }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Beds', href: '/beds' },
        { title: bed.bed_number, href: `/beds/${bed.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Bed: ${bed.bed_number}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Bed {bed.bed_number}</h1>
                        <p className="text-muted-foreground text-sm">Bed Details</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('beds.edit', bed.id)}>
                            <Button variant="outline" className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => router.visit(route('beds.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Bed Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="ID" value={bed.id} />
                        <Info label="Room" value={bed.room?.room_number} />
                        <Info label="Bed Number" value={bed.bed_number} />
                        <Info label="Bed Type" value={bed.bed_type} />
                        <Info label="Status" value={bed.status} />
                        <Info label="Isolated" value={bed.is_isolated ? 'Yes' : 'No'} />
                        <Info label="Active" value={bed.is_active ? 'Yes' : 'No'} />
                        <Info label="Last Cleaned By" value={bed.lastCleaner?.employee_id ?? bed.last_cleaned_by ?? '-'} />
                        <Info label="Last Cleaned Date" value={bed.last_cleaned_date} />
                        <Info label="Occupied Since" value={bed.occupied_since} />
                        <Info label="Expected Vacate" value={bed.expected_vacate_date} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Equipment</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <Info label="Ventilator" value={bed.has_ventilator ? 'Yes' : 'No'} />
                        <Info label="Monitor" value={bed.has_monitor ? 'Yes' : 'No'} />
                        <Info label="Suction" value={bed.has_suction ? 'Yes' : 'No'} />
                        <Info label="Oxygen" value={bed.has_oxygen ? 'Yes' : 'No'} />
                    </CardContent>
                </Card>

                {(bed.current_patient_id || bed.current_encounter_id || bed.notes) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <Info label="Current Patient ID" value={bed.current_patient_id} />
                            <Info label="Current Encounter ID" value={bed.current_encounter_id} />
                            {bed.notes && (
                                <div className="md:col-span-2">
                                    <p className="text-muted-foreground text-sm">Notes</p>
                                    <p className="font-medium">{bed.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
