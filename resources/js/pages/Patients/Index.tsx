import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import OfflinePage from '../OfflinePage';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
    patients: {
        data: Patient[];
        links: any[];
    };
}

export default function PatientsIndex({ patients }: Props) {
    const { hasPermission } = usePermission();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Patients', href: '/patients' },
    ];

    const [online, setOnline] = useState(navigator.onLine);
    useEffect(() => {
        window.addEventListener('online', () => setOnline(true));
        window.addEventListener('offline', () => setOnline(false));
    }, []);

    if (!online) return <OfflinePage />;
    // Calculate Age
    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };
    const handleDelete = (id: number) => {
        router.delete(`/patients/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Patient deleted successfully'),
            onError: () => toast.error('Failed to delete patient'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Patient Management</h1>

                    {/* permission check for patient */}
                    <Link href={route('patients.create')}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Patient
                        </Button>
                    </Link>

                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Age/Gender</TableHead>

                                    <TableHead>Blood Group</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {patients.data.map((patient) => (
                                    <TableRow key={patient.patient_id}>
                                        {/* Patient Info */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={patient.profile_photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(patient.name)}
                                                    alt={patient.name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium">{patient.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        #{patient.patient_id}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        {/* Age + Gender */}
                                        <TableCell>
                                            <div className="text-sm flex gap-2 items-center">
                                                <span>{calculateAge(patient.date_of_birth)} yrs</span>
                                                <span className="text-muted-foreground">| {patient.gender}</span>
                                            </div>
                                        </TableCell>


                                        <TableCell>{patient.blood_group || '-'}</TableCell>


                                        <TableCell>{patient.diagnosis || 'N/A'}</TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* permission check for patient view */}
                                                <Link href={route('patients.show', patient.patient_id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>


                                                <Link href={route('patients.edit', patient.patient_id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                {/* Delete */}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete <span className="font-semibold">{patient.name}</span>?
                                                                This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(patient.patient_id)}
                                                                className="bg-red-600 text-white hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {patients.links && patients.links.length > 1 && <Pagination links={patients.links} />}
            </div>
        </AppLayout>
    );
}