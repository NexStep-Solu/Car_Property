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

interface Props {
    patients: Patient[];
}

export default function InsurancesCreate({ patients }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Insurances', href: '/insurances' },
        { title: 'Create', href: '/insurances/create' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        patient_id: '',
        insurance_provider: '',
        policy_number: '',
        group_number: '',
        plan_name: '',
        coverage_start_date: '',
        coverage_end_date: '',
        coverage_percentage: '',
        max_coverage_amount: '',
        status: 'active',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('insurances.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Insurance created successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
                reset();
            },
            onError: () => {
                toast.error('Error creating insurance', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Insurance" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Create New Insurance</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Insurance Information</CardTitle>
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
                                <Label htmlFor="insurance_provider">Insurance Provider *</Label>
                                <Input
                                    id="insurance_provider"
                                    type="text"
                                    required
                                    value={data.insurance_provider}
                                    onChange={(e) => setData('insurance_provider', e.target.value)}
                                    disabled={processing}
                                    placeholder="e.g., Blue Cross, Aetna"
                                />
                                <InputError message={errors.insurance_provider} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="policy_number">Policy Number *</Label>
                                    <Input
                                        id="policy_number"
                                        type="text"
                                        required
                                        value={data.policy_number}
                                        onChange={(e) => setData('policy_number', e.target.value)}
                                        disabled={processing}
                                        placeholder="Policy number"
                                    />
                                    <InputError message={errors.policy_number} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="group_number">Group Number</Label>
                                    <Input
                                        id="group_number"
                                        type="text"
                                        value={data.group_number}
                                        onChange={(e) => setData('group_number', e.target.value)}
                                        disabled={processing}
                                        placeholder="Group number"
                                    />
                                    <InputError message={errors.group_number} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="plan_name">Plan Name</Label>
                                <Input
                                    id="plan_name"
                                    type="text"
                                    value={data.plan_name}
                                    onChange={(e) => setData('plan_name', e.target.value)}
                                    disabled={processing}
                                    placeholder="e.g., Gold Plan, Premium"
                                />
                                <InputError message={errors.plan_name} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="coverage_start_date">Coverage Start Date *</Label>
                                    <Input
                                        id="coverage_start_date"
                                        type="date"
                                        required
                                        value={data.coverage_start_date}
                                        onChange={(e) => setData('coverage_start_date', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.coverage_start_date} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="coverage_end_date">Coverage End Date *</Label>
                                    <Input
                                        id="coverage_end_date"
                                        type="date"
                                        required
                                        value={data.coverage_end_date}
                                        onChange={(e) => setData('coverage_end_date', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.coverage_end_date} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="coverage_percentage">Coverage Percentage (%) *</Label>
                                    <Input
                                        id="coverage_percentage"
                                        type="number"
                                        min="0"
                                        max="100"
                                        required
                                        value={data.coverage_percentage}
                                        onChange={(e) => setData('coverage_percentage', e.target.value)}
                                        disabled={processing}
                                        placeholder="0-100"
                                    />
                                    <InputError message={errors.coverage_percentage} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="max_coverage_amount">Max Coverage Amount *</Label>
                                    <Input
                                        id="max_coverage_amount"
                                        type="number"
                                        min="0"
                                        required
                                        value={data.max_coverage_amount}
                                        onChange={(e) => setData('max_coverage_amount', e.target.value)}
                                        disabled={processing}
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.max_coverage_amount} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)} disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} className="mt-1" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('insurances.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Insurance
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
