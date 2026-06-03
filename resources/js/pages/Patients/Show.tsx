import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, ArrowLeft } from 'lucide-react';

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

function Info({ label, value }: { label: string; value?: string | null | boolean }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value !== undefined && value !== null ? value.toString() : '-'}</p>
        </div>
    );
}

// Helper to calculate age
const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export default function PatientsShow({ patient }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Patients', href: '/patients' },
        { title: patient.name, href: `/patients/${patient.patient_id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Patient: ${patient.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.visit(route('patients.index'))}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">{patient.name}</h1>
                    </div>
                    <Link href={route('patients.edit', patient.patient_id)}>
                        <Button variant="outline" className="gap-2">
                            <Pencil className="h-4 w-4" /> Edit
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="Name" value={patient.name} />
                        <Info label="Gender" value={patient.gender} />
                        <Info label="Age" value={`${calculateAge(patient.date_of_birth)} yrs`} />
                        <Info label="Blood Group" value={patient.blood_group} />
                        <Info label="Marital Status" value={patient.marital_status} />

                        {/* <Info label="Occupation" value={patient.occupation} />
                        <Info label="Nationality" value={patient.nationality} />
                        <Info label="Preferred Language" value={patient.preferred_language} /> */}

                        <Info label="Registration Date" value={new Date(patient.registration_date).toLocaleDateString()} />
                        <Info label="Deceased" value={patient.is_deceased ? 'Yes' : 'No'} />
                        {!!patient.is_deceased && <Info label="Deceased Date" value={patient.deceased_date} />}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Medical & Emergency Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="Diagnosis" value={patient.diagnosis} />
                        <Info label="Emergency Contact Name" value={patient.emergency_contact_name} />
                        <Info label="Emergency Contact Phone" value={patient.emergency_contact_phone} />
                        <Info label="Emergency Contact Relation" value={patient.emergency_contact_relation} />
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground text-sm">Notes</p>
                            <p className="font-medium">{patient.notes || '-'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}