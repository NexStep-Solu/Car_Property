import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

interface Props { }

export default function PatientsCreate({ }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Patients', href: '/patients' },
        { title: 'Create', href: '/patients/create' },
    ];
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        diagnosis: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        marital_status: '',
        occupation: '',
        nationality: '',
        preferred_language: '',
        registration_date: new Date().toISOString().slice(0, 10), // default today
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',
        profile_photo_url: null as File | null,
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('patients.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Patient created successfully!', { position: 'top-center', duration: 3000 });
                reset();
            },
            onError: () => {
                toast.error('Error creating patient. Check the form!', { position: 'top-center', duration: 3000 });
            },
        });
    };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('profile_photo_url', file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Create Patient" />

                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <h1 className="text-2xl font-bold mb-4">Create New Patient</h1>

                    <form onSubmit={submit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Patient Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">


                                {/* Profile Photo */}
                                <div className="flex items-center gap-4">
                                    <img
                                        src={
                                            imagePreview ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Patient')}`
                                        }
                                        className="h-16 w-16 rounded-full object-cover border"
                                    />

                                    <div className="flex-1 grid gap-2">
                                        <Label>Profile Photo</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        <InputError message={errors.profile_photo_url} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.date_of_birth} />
                                </div>



                                <div className="grid gap-2">
                                    <Label htmlFor="gender">Gender *</Label>
                                    <Select
                                        value={data.gender}
                                        onValueChange={(value) => setData('gender', value)}
                                        required
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
                                    <InputError message={errors.gender} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="blood_group">Blood Group</Label>
                                    <Select
                                        value={data.blood_group}
                                        onValueChange={(value) => setData('blood_group', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select blood group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                                                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.blood_group} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="diagnosis">Diagnosis</Label>
                                    <Textarea
                                        id="diagnosis"
                                        value={data.diagnosis}
                                        onChange={(e) => setData('diagnosis', e.target.value)}
                                        rows={2}
                                        placeholder="Enter diagnosis details..."
                                    />
                                    <InputError message={errors.diagnosis} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="marital_status">Marital Status</Label>
                                    <Select
                                        value={data.marital_status}
                                        onValueChange={(value) => setData('marital_status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select marital status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Single', 'Married', 'Divorced', 'Widowed'].map((status) => (
                                                <SelectItem key={status} value={status}>{status}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.marital_status} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="registration_date">Registration Date *</Label>
                                    <Input
                                        id="registration_date"
                                        type="date"
                                        value={data.registration_date}
                                        onChange={(e) => setData('registration_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.registration_date} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                    />
                                    <InputError message={errors.notes} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>

                            <CardHeader>
                                <CardTitle>Emergency Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">



                                {/* <div className="grid gap-2">
                                    <Label htmlFor="occupation">Occupation</Label>
                                    <Input
                                        id="occupation"
                                        type="text"
                                        value={data.occupation}
                                        onChange={(e) => setData('occupation', e.target.value)}
                                    />
                                    <InputError message={errors.occupation} />
                                </div>

                               
                                <div className="grid gap-2">
                                    <Label htmlFor="nationality">Nationality</Label>
                                    <Input
                                        id="nationality"
                                        type="text"
                                        value={data.nationality}
                                        onChange={(e) => setData('nationality', e.target.value)}
                                    />
                                    <InputError message={errors.nationality} />
                                </div>

                                
                                <div className="grid gap-2">
                                    <Label htmlFor="preferred_language">Preferred Language</Label>
                                    <Input
                                        id="preferred_language"
                                        type="text"
                                        value={data.preferred_language}
                                        onChange={(e) => setData('preferred_language', e.target.value)}
                                    />
                                    <InputError message={errors.preferred_language} />
                                </div> */}



                                {/* Emergency Contact Name */}
                                <div className="grid gap-2">
                                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                                    <Input
                                        id="emergency_contact_name"
                                        type="text"
                                        value={data.emergency_contact_name}
                                        onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                    />
                                    <InputError message={errors.emergency_contact_name} />
                                </div>

                                {/* Emergency Contact Phone */}
                                <div className="grid gap-2">
                                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                                    <Input
                                        id="emergency_contact_phone"
                                        type="text"
                                        value={data.emergency_contact_phone}
                                        onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                    />
                                    <InputError message={errors.emergency_contact_phone} />
                                </div>

                                {/* Emergency Contact Relation */}
                                <div className="grid gap-2">
                                    <Label htmlFor="emergency_contact_relation">Emergency Contact Relation</Label>
                                    <Input
                                        id="emergency_contact_relation"
                                        type="text"
                                        value={data.emergency_contact_relation}
                                        onChange={(e) => setData('emergency_contact_relation', e.target.value)}
                                    />
                                    <InputError message={errors.emergency_contact_relation} />
                                </div>


                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.visit(route('patients.index'))} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Create Patient
                            </Button>
                        </div>
                    </form>
                </div>
            </AppLayout>
        </>
    );
}