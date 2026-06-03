import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import OfflinePage from '../OfflinePage';

interface Vital {
    id: number;
    patient_id: number;
    patient: { name: string };
    recorded_at: string;
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    heart_rate?: number;
    temperature?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
    weight?: number;
    height?: number;
    blood_glucose?: number;
}

interface Props {
    vitals: {
        data: Vital[];
        links: any[];
    };
}

export default function VitalsIndex({ vitals }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Vitals', href: '/vitals' }];

    const [online, setOnline] = useState(navigator.onLine);
    useEffect(() => {
        window.addEventListener('online', () => setOnline(true));
        window.addEventListener('offline', () => setOnline(false));
    }, []);

    if (!online) return <OfflinePage />;

    const handleDelete = (id: number) => {
        router.delete(`/vitals/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Vital signs deleted successfully'),
            onError: () => toast.error('Failed to delete vital signs'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vital Signs" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Vital Signs</h1>
                    <Link href={route('vitals.create')}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Record Vitals
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Vital Signs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>BP (mmHg)</TableHead>
                                    <TableHead>HR (bpm)</TableHead>
                                    <TableHead>Temp (°C)</TableHead>
                                    <TableHead>SpO2 (%)</TableHead>
                                    <TableHead>Weight (kg)</TableHead>
                                    <TableHead>Recorded</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vitals.data.map((vital) => (
                                    <TableRow key={vital.id}>
                                        <TableCell className="font-medium">{vital.patient?.name}</TableCell>
                                        <TableCell>
                                            {vital.blood_pressure_systolic && vital.blood_pressure_diastolic
                                                ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`
                                                : '-'}
                                        </TableCell>
                                        <TableCell>{vital.heart_rate || '-'}</TableCell>
                                        <TableCell>{vital.temperature || '-'}</TableCell>
                                        <TableCell>{vital.oxygen_saturation || '-'}</TableCell>
                                        <TableCell>{vital.weight || '-'}</TableCell>
                                        <TableCell>{new Date(vital.recorded_at).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('vitals.show', vital.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="hover:bg-red-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Vital Signs</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete these vital signs?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(vital.id)} className="bg-red-600">
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

                {vitals.links && vitals.links.length > 1 && <Pagination links={vitals.links} />}
            </div>
        </AppLayout>
    );
}
