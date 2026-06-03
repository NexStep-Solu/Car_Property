import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export default function LabTestsCreate({ patients, doctors }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Lab Tests', href: '/lab-tests' },
        { title: 'Create', href: '/lab-tests/create' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        patient_id: '',
        doctor_id: '',
        test_name: '',
        test_code: '',
        category: '',
        ordered_date: new Date().toISOString().split('T')[0],
        result: '',
        normal_range: '',
        unit: '',
        status: 'ordered',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('lab-tests.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Lab test ordered successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
                reset();
            },
            onError: () => {
                toast.error('Error ordering lab test', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order Lab Test" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Order New Lab Test</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Information</CardTitle>
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
                                <Label htmlFor="doctor_id">Ordering Doctor *</Label>
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
                                    <Label htmlFor="test_name">Test Name *</Label>
                                    <Input
                                        id="test_name"
                                        type="text"
                                        required
                                        value={data.test_name}
                                        onChange={(e) => setData('test_name', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., Complete Blood Count"
                                    />
                                    <InputError message={errors.test_name} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="test_code">Test Code</Label>
                                    <Input
                                        id="test_code"
                                        type="text"
                                        value={data.test_code}
                                        onChange={(e) => setData('test_code', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., CBC"
                                    />
                                    <InputError message={errors.test_code} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        type="text"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., Hematology"
                                    />
                                    <InputError message={errors.category} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="ordered_date">Ordered Date *</Label>
                                    <Input
                                        id="ordered_date"
                                        type="date"
                                        required
                                        value={data.ordered_date}
                                        onChange={(e) => setData('ordered_date', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.ordered_date} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="result">Result</Label>
                                    <Input
                                        id="result"
                                        type="text"
                                        value={data.result}
                                        onChange={(e) => setData('result', e.target.value)}
                                        disabled={processing}
                                        placeholder="Test result"
                                    />
                                    <InputError message={errors.result} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="normal_range">Normal Range</Label>
                                    <Input
                                        id="normal_range"
                                        type="text"
                                        value={data.normal_range}
                                        onChange={(e) => setData('normal_range', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., 4.5-11.0"
                                    />
                                    <InputError message={errors.normal_range} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="unit">Unit</Label>
                                    <Input
                                        id="unit"
                                        type="text"
                                        value={data.unit}
                                        onChange={(e) => setData('unit', e.target.value)}
                                        disabled={processing}
                                        placeholder="e.g., x10^9/L"
                                    />
                                    <InputError message={errors.unit} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)} disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ordered">Ordered</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} className="mt-1" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('lab-tests.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Order Test
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
