import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

interface Vital {
    id: number;
    patient: { name: string };
    recorded_at: string;
    blood_pressure_systolic: number | null;
    blood_pressure_diastolic: number | null;
    heart_rate: number | null;
    temperature: number | null;
    respiratory_rate: number | null;
    oxygen_saturation: number | null;
    weight: number | null;
    height: number | null;
    blood_glucose: number | null;
}

interface Props {
    vital: Vital;
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function VitalsShow({ vital }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vitals', href: '/vitals' },
        { title: vital.patient.name, href: `/vitals/${vital.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Vital Signs: ${vital.patient.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Vital Signs</h1>
                        <p className="text-muted-foreground text-sm">{vital.patient.name}</p>
                    </div>
                    <Button variant="secondary" onClick={() => router.visit(route('vitals.index'))}>
                        Back
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Vital Signs Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                        <Info label="Patient" value={vital.patient?.name} />
                        <Info label="Recorded At" value={new Date(vital.recorded_at).toLocaleString()} />
                        <div className="mt-2 border-t pt-4 md:col-span-2 lg:col-span-3">
                            <p className="text-muted-foreground mb-4 font-medium">Vital Measurements</p>
                        </div>
                        <Info
                            label="Blood Pressure"
                            value={
                                vital.blood_pressure_systolic && vital.blood_pressure_diastolic
                                    ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic} mmHg`
                                    : null
                            }
                        />
                        <Info label="Heart Rate" value={vital.heart_rate ? `${vital.heart_rate} bpm` : null} />
                        <Info label="Temperature" value={vital.temperature ? `${vital.temperature} °C` : null} />
                        <Info label="Respiratory Rate" value={vital.respiratory_rate ? `${vital.respiratory_rate} breaths/min` : null} />
                        <Info label="Oxygen Saturation" value={vital.oxygen_saturation ? `${vital.oxygen_saturation}%` : null} />
                        <Info label="Weight" value={vital.weight ? `${vital.weight} kg` : null} />
                        <Info label="Height" value={vital.height ? `${vital.height} cm` : null} />
                        <Info label="Blood Glucose" value={vital.blood_glucose ? `${vital.blood_glucose} mg/dL` : null} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
