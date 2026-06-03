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

interface User {
    id: number;
    name: string;
}

interface Props {
    patients: Patient[];
    doctors: User[];
}

export default function MedicalRecordsCreate({ patients, doctors }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Medical Records', href: '/medical-records' },
        { title: 'Create', href: '/medical-records/create' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        patient_id: '',
        doctor_id: '',
        record_type: 'consultation',
        record_date: new Date().toISOString().split('T')[0],
        chief_complaint: '',
        diagnosis: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('medical-records.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Medical record created successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
                reset();
            },
            onError: () => {
                toast.error('Error creating medical record', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Medical Record" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Create New Medical Record</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Record Information</CardTitle>
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
                                <Label htmlFor="doctor_id">Doctor *</Label>
                                <Select value={data.doctor_id} onValueChange={(value) => setData('doctor_id', value)} disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map((doctor) => (
                                            <SelectItem key={doctor.id} value={String(doctor.id)}>
                                                {doctor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.doctor_id} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="record_type">Record Type</Label>
                                    <Select value={data.record_type} onValueChange={(value) => setData('record_type', value)} disabled={processing}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="consultation">Consultation</SelectItem>
                                            <SelectItem value="procedure">Procedure</SelectItem>
                                            <SelectItem value="follow_up">Follow Up</SelectItem>
                                            <SelectItem value="emergency">Emergency</SelectItem>
                                            <SelectItem value="surgery">Surgery</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.record_type} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="record_date">Record Date *</Label>
                                    <Input
                                        id="record_date"
                                        type="date"
                                        required
                                        value={data.record_date}
                                        onChange={(e) => setData('record_date', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.record_date} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="chief_complaint">Chief Complaint</Label>
                                <Input
                                    id="chief_complaint"
                                    type="text"
                                    value={data.chief_complaint}
                                    onChange={(e) => setData('chief_complaint', e.target.value)}
                                    disabled={processing}
                                    placeholder="Main reason for visit"
                                />
                                <InputError message={errors.chief_complaint} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="diagnosis">Diagnosis</Label>
                                <Textarea
                                    id="diagnosis"
                                    value={data.diagnosis}
                                    onChange={(e) => setData('diagnosis', e.target.value)}
                                    disabled={processing}
                                    placeholder="Diagnosis details..."
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
                                    rows={4}
                                />
                                <InputError message={errors.notes} className="mt-1" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('medical-records.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Record
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
