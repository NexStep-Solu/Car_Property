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

interface Props {
    patients: Patient[];
}

export default function VitalsCreate({ patients }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vitals', href: '/vitals' },
        { title: 'Create', href: '/vitals/create' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        patient_id: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        heart_rate: '',
        temperature: '',
        respiratory_rate: '',
        oxygen_saturation: '',
        weight: '',
        height: '',
        blood_glucose: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('vitals.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Vital signs recorded successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
                reset();
            },
            onError: () => {
                toast.error('Error recording vital signs', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Record Vital Signs" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Record Vital Signs</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="patient_id">Patient *</Label>
                                <select
                                    id="patient_id"
                                    required
                                    value={data.patient_id}
                                    onChange={(e) => setData('patient_id', e.target.value)}
                                    disabled={processing}
                                    className="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select a patient</option>
                                    {patients.map((patient) => (
                                        <option key={patient.patient_id} value={patient.patient_id}>
                                            {patient.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.patient_id} className="mt-1" />
                            </div>
                        </CardContent>
                    </Card>

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
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('vitals.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Record Vitals
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
