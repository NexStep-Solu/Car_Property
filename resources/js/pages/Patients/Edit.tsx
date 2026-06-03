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
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Patient {
    patient_id: number;
    name: string;
    diagnosis?: string;
    date_of_birth: string;
    gender: string;
    blood_group?: string;
    marital_status?: string;
    occupation?: string;
    nationality?: string;
    preferred_language?: string;
    registration_date: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
    profile_photo_url?: string;
    is_deceased?: boolean;
    deceased_date?: string;
    notes?: string;
}

interface Props {
    patient: Patient;
}

export default function PatientsEdit({ patient }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Patients', href: '/patients' },
        { title: 'Edit', href: `/patients/${patient.patient_id}/edit` },
    ];

    const { data, setData, put, processing, errors, isDirty } = useForm({
        name: patient.name || '',
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || '',
        blood_group: patient.blood_group || '',
        marital_status: patient.marital_status || '',
        occupation: patient.occupation || '',
        nationality: patient.nationality || '',
        preferred_language: patient.preferred_language || '',
        diagnosis: patient.diagnosis || '',
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
        emergency_contact_relation: patient.emergency_contact_relation || '',
        notes: patient.notes || '',
        is_deceased: patient.is_deceased || false,
        deceased_date: patient.deceased_date || '',
        registration_date: patient.registration_date || ''
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        
        const payload = {
            ...data,
             registration_date: patient.registration_date,
            is_deceased: data.is_deceased ? 1 : 0,
            deceased_date: data.is_deceased ? data.deceased_date : null,
        };

        put(route('patients.update', patient.patient_id), {
            ...payload,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Patient updated successfully.');
            },
             onError: (err) => {
            console.log(err); // optional debug
        },
        });
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Patient" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">Edit Patient</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={processing}
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        required
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.date_of_birth} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="gender">Gender *</Label>
                                    <Select
                                        value={data.gender || undefined}
                                        onValueChange={(value) => setData('gender', value)}
                                        disabled={processing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.gender} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="blood_group">Blood Group</Label>
                                    <Input
                                        id="blood_group"
                                        type="text"
                                        value={data.blood_group}
                                        onChange={(e) => setData('blood_group', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.blood_group} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="marital_status">Marital Status</Label>
                                    <Input
                                        id="marital_status"
                                        type="text"
                                        value={data.marital_status}
                                        onChange={(e) => setData('marital_status', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.marital_status} className="mt-1" />
                                </div>

                                {/* <div className="grid gap-2">
                                    <Label htmlFor="occupation">Occupation</Label>
                                    <Input
                                        id="occupation"
                                        type="text"
                                        value={data.occupation}
                                        onChange={(e) => setData('occupation', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.occupation} className="mt-1" />
                                </div> */}
                            </div>

                            {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="nationality">Nationality</Label>
                                    <Input
                                        id="nationality"
                                        type="text"
                                        value={data.nationality}
                                        onChange={(e) => setData('nationality', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.nationality} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="preferred_language">Preferred Language</Label>
                                    <Input
                                        id="preferred_language"
                                        type="text"
                                        value={data.preferred_language}
                                        onChange={(e) => setData('preferred_language', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.preferred_language} className="mt-1" />
                                </div>
                            </div> */}
                        </CardContent>
                    </Card>

                    {/* Medical Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Medical & Emergency Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="diagnosis">Diagnosis</Label>
                                <Textarea
                                    id="diagnosis"
                                    value={data.diagnosis}
                                    onChange={(e) => setData('diagnosis', e.target.value)}
                                    disabled={processing}
                                    rows={2}
                                />
                                <InputError message={errors.diagnosis} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                                    <Input
                                        id="emergency_contact_name"
                                        type="text"
                                        value={data.emergency_contact_name}
                                        onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.emergency_contact_name} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                                    <Input
                                        id="emergency_contact_phone"
                                        type="tel"
                                        value={data.emergency_contact_phone}
                                        onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.emergency_contact_phone} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="emergency_contact_relation">Emergency Contact Relation</Label>
                                    <Input
                                        id="emergency_contact_relation"
                                        type="text"
                                        value={data.emergency_contact_relation}
                                        onChange={(e) => setData('emergency_contact_relation', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.emergency_contact_relation} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    disabled={processing}
                                    rows={3}
                                />
                                <InputError message={errors.notes} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="is_deceased">Deceased</Label>
                                <Select
                                    value={data.is_deceased ? 'true' : 'false'}
                                    onValueChange={(value) => setData('is_deceased', value === 'true')}
                                    disabled={processing}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="false">No</SelectItem>
                                        <SelectItem value="true">Yes</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.is_deceased} className="mt-1" />
                            </div>

                            {data.is_deceased && (
                                <div className="grid gap-2">
                                    <Label htmlFor="deceased_date">Deceased Date</Label>
                                    <Input
                                        id="deceased_date"
                                        type="date"
                                        value={data.deceased_date}
                                        onChange={(e) => setData('deceased_date', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.deceased_date} className="mt-1" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('patients.index'))} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || !isDirty}>
                            Update Patient
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}