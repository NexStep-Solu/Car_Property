import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface Department {
    id: number;
    name: string;
}

interface Doctor {
    id: number;
    name: string;
}

interface Patient {
    patient_id: number;
    name: string;
}

interface Props {
    patients: Patient[];
    doctors: Doctor[];
    departments: Department[];
}

export default function AppointmentsCreate() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Appointments', href: '/appointments' },
        { title: 'Create', href: '/appointments/create' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        patient_id: '',
        doctor_id: '',
        department_id: '',
        type: 'new',
        appointment_date: '',
        appointment_time: '',
        reason: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('appointments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Appointment created successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
                reset();
            },
            onError: () => {
                toast.error('Error creating appointment', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Appointment" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href="/appointments">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Create Appointment</h1>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="patient_id">Patient *</Label>
                                    <select
                                        name="patient_id"
                                        id="patient_id"
                                        required
                                        className="w-full rounded border p-2"
                                        value={data.patient_id}
                                        onChange={(e) => setData('patient_id', e.target.value)}
                                        disabled={processing}
                                    >
                                        <option value="">Select Patient</option>
                                        {usePage().props.patients?.map((patient: Patient) => (
                                            <option key={patient.patient_id} value={patient.patient_id}>
                                                {patient.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.patient_id} className="mt-1" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="doctor_id">Doctor *</Label>
                                    <select
                                        name="doctor_id"
                                        id="doctor_id"
                                        required
                                        className="w-full rounded border p-2"
                                        value={data.doctor_id}
                                        onChange={(e) => setData('doctor_id', e.target.value)}
                                        disabled={processing}
                                    >
                                        <option value="">Select Doctor</option>
                                        {usePage().props.doctors?.map((doctor: Doctor) => (
                                            <option key={doctor.id} value={doctor.id}>
                                                {doctor.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.doctor_id} className="mt-1" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department_id">Department</Label>
                                    <select
                                        name="department_id"
                                        id="department_id"
                                        className="w-full rounded border p-2"
                                        value={data.department_id}
                                        onChange={(e) => setData('department_id', e.target.value)}
                                        disabled={processing}
                                    >
                                        <option value="">Select Department</option>
                                        {usePage().props.departments?.map((dept: Department) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.department_id} className="mt-1" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <select
                                        name="type"
                                        id="type"
                                        className="w-full rounded border p-2"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        disabled={processing}
                                    >
                                        <option value="new">New</option>
                                        <option value="follow_up">Follow Up</option>
                                        <option value="emergency">Emergency</option>
                                    </select>
                                    <InputError message={errors.type} className="mt-1" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="appointment_date">Date *</Label>
                                    <Input
                                        type="date"
                                        name="appointment_date"
                                        id="appointment_date"
                                        required
                                        value={data.appointment_date}
                                        onChange={(e) => setData('appointment_date', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.appointment_date} className="mt-1" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="appointment_time">Time *</Label>
                                    <Input
                                        type="time"
                                        name="appointment_time"
                                        id="appointment_time"
                                        required
                                        value={data.appointment_time}
                                        onChange={(e) => setData('appointment_time', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.appointment_time} className="mt-1" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="reason">Reason</Label>
                                    <Input
                                        type="text"
                                        name="reason"
                                        id="reason"
                                        placeholder="Reason for visit"
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.reason} className="mt-1" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea
                                        name="notes"
                                        id="notes"
                                        rows={3}
                                        className="w-full rounded border p-2"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.notes} className="mt-1" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Link href="/appointments">
                                    <Button type="button" variant="outline" disabled={processing}>
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Appointment
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
