import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface Patient {
    patient_id: number;
    name: string;
}

interface Vital {
    id: number;
    patient_id: number;
    patient: Patient;
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
    notes: string | null;
}

interface Props {
    vital: Vital;
    patients: Patient[];
}

export default function VitalsEdit({ vital, patients }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vitals', href: '/vitals' },
        { title: vital.patient?.name || 'Vital', href: `/vitals/${vital.id}/edit` },
    ];

    const { data, setData, put, processing, errors, isDirty } = useForm({
        blood_pressure_systolic: vital.blood_pressure_systolic?.toString() || '',
        blood_pressure_diastolic: vital.blood_pressure_diastolic?.toString() || '',
        heart_rate: vital.heart_rate?.toString() || '',
        temperature: vital.temperature?.toString() || '',
        respiratory_rate: vital.respiratory_rate?.toString() || '',
        oxygen_saturation: vital.oxygen_saturation?.toString() || '',
        weight: vital.weight?.toString() || '',
        height: vital.height?.toString() || '',
        blood_glucose: vital.blood_glucose?.toString() || '',
        notes: vital.notes || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('vitals.update', vital.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Vital signs updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating vital signs', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Vital Signs" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Edit Vital Signs</h1>
                    <p className="text-muted-foreground text-sm">Patient: {vital.patient?.name}</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vital Signs</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="blood_pressure_systolic">Blood Pressure Systolic (mmHg)</Label>
                                    <Input
                                        id="blood_pressure_systolic"
                                        type="number"
                                        min="0"
                                        value={data.blood_pressure_systolic}
                                        onChange={(e) => setData('blood_pressure_systolic', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 120"
                                    />
                                    <InputError message={errors.blood_pressure_systolic} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="blood_pressure_diastolic">Blood Pressure Diastolic (mmHg)</Label>
                                    <Input
                                        id="blood_pressure_diastolic"
                                        type="number"
                                        min="0"
                                        value={data.blood_pressure_diastolic}
                                        onChange={(e) => setData('blood_pressure_diastolic', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 80"
                                    />
                                    <InputError message={errors.blood_pressure_diastolic} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                                    <Input
                                        id="heart_rate"
                                        type="number"
                                        min="0"
                                        value={data.heart_rate}
                                        onChange={(e) => setData('heart_rate', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 72"
                                    />
                                    <InputError message={errors.heart_rate} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="temperature">Temperature (°C)</Label>
                                    <Input
                                        id="temperature"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={data.temperature}
                                        onChange={(e) => setData('temperature', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 36.5"
                                    />
                                    <InputError message={errors.temperature} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="respiratory_rate">Respiratory Rate (breaths/min)</Label>
                                    <Input
                                        id="respiratory_rate"
                                        type="number"
                                        min="0"
                                        value={data.respiratory_rate}
                                        onChange={(e) => setData('respiratory_rate', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 16"
                                    />
                                    <InputError message={errors.respiratory_rate} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="oxygen_saturation">Oxygen Saturation (%)</Label>
                                    <Input
                                        id="oxygen_saturation"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.oxygen_saturation}
                                        onChange={(e) => setData('oxygen_saturation', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 98"
                                    />
                                    <InputError message={errors.oxygen_saturation} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="weight">Weight (kg)</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={data.weight}
                                        onChange={(e) => setData('weight', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 70"
                                    />
                                    <InputError message={errors.weight} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="height">Height (cm)</Label>
                                    <Input
                                        id="height"
                                        type="number"
                                        min="0"
                                        value={data.height}
                                        onChange={(e) => setData('height', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 170"
                                    />
                                    <InputError message={errors.height} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="blood_glucose">Blood Glucose (mg/dL)</Label>
                                    <Input
                                        id="blood_glucose"
                                        type="number"
                                        min="0"
                                        value={data.blood_glucose}
                                        onChange={(e) => setData('blood_glucose', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 100"
                                    />
                                    <InputError message={errors.blood_glucose} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Input
                                        id="notes"
                                        type="text"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        disabled={processing}
                                        placeholder="Additional notes..."
                                    />
                                    <InputError message={errors.notes} className="mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('vitals.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || !isDirty}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Vitals
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
