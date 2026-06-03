import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

interface Bed {
    id: number;
    bed_number: string;
    room: { room_number: string };
}

interface Props {
    patients: Patient[];
    beds: Bed[];
}

export default function IpdRecordsCreate({ patients, beds }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'IPD Records', href: '/ipd-records' },
        { title: 'Create', href: '/ipd-records/create' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        patient_id: '',
        bed_id: '',
        admission_date: new Date().toISOString().split('T')[0],
        diagnosis: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('ipd-records.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Patient admitted successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
                reset();
            },
            onError: () => {
                toast.error('Error admitting patient', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admit Patient" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Admit New Patient</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Admission Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="patient_id">Patient *</Label>
                                <Select value={data.patient_id} onValueChange={(value) => setData('patient_id', value)} disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map((patient) => (
                                            <SelectItem key={patient.patient_id} value={String(patient.patient_id)}>
                                                {patient.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.patient_id} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="bed_id">Bed *</Label>
                                <Select value={data.bed_id} onValueChange={(value) => setData('bed_id', value)} disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a bed" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {beds.map((bed) => (
                                            <SelectItem key={bed.id} value={String(bed.id)}>
                                                {bed.bed_number} - Room {bed.room?.room_number}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.bed_id} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="admission_date">Admission Date *</Label>
                                    <Input
                                        id="admission_date"
                                        type="date"
                                        required
                                        value={data.admission_date}
                                        onChange={(e) => setData('admission_date', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.admission_date} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="diagnosis">Diagnosis *</Label>
                                <Textarea
                                    id="diagnosis"
                                    required
                                    value={data.diagnosis}
                                    onChange={(e) => setData('diagnosis', e.target.value)}
                                    disabled={processing}
                                    placeholder="Enter diagnosis..."
                                    rows={3}
                                />
                                <InputError message={errors.diagnosis} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    disabled={processing}
                                    placeholder="Additional notes..."
                                    rows={3}
                                />
                                <InputError message={errors.notes} className="mt-1" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('ipd-records.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Admit Patient
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
