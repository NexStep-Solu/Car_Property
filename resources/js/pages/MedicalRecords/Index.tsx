import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
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

interface MedicalRecord {
    id: number;
    patient_id: number;
    patient: { name: string };
    doctor_id: number;
    doctor?: { name: string };
    record_type: string;
    record_date: string;
    chief_complaint?: string;
    diagnosis?: string;
}

interface Props {
    records: {
        data: MedicalRecord[];
        links: any[];
    };
}

export default function MedicalRecordsIndex({ records }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Medical Records', href: '/medical-records' }];

    const [online, setOnline] = useState(navigator.onLine);
    useEffect(() => {
        window.addEventListener('online', () => setOnline(true));
        window.addEventListener('offline', () => setOnline(false));
    }, []);

    if (!online) return <OfflinePage />;

    const handleDelete = (id: number) => {
        router.delete(`/medical-records/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Medical record deleted successfully'),
            onError: () => toast.error('Failed to delete medical record'),
        });
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            consultation: 'bg-blue-100 text-blue-800',
            procedure: 'bg-purple-100 text-purple-800',
            follow_up: 'bg-green-100 text-green-800',
            emergency: 'bg-red-100 text-red-800',
            surgery: 'bg-orange-100 text-orange-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medical Records" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Medical Records</h1>
                    <Link href={route('medical-records.create')}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> New Record
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Medical Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.data.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">{record.patient?.name}</TableCell>
                                        <TableCell>{record.doctor?.name || 'N/A'}</TableCell>
                                        <TableCell>
                                            <span className={`rounded-full px-2 py-1 text-xs ${getTypeColor(record.record_type)}`}>
                                                {record.record_type}
                                            </span>
                                        </TableCell>
                                        <TableCell>{record.record_date}</TableCell>
                                        <TableCell className="max-w-xs truncate">{record.diagnosis || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('medical-records.show', record.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={route('medical-records.edit', record.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Pencil className="h-4 w-4" />
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
                                                            <AlertDialogTitle>Delete Medical Record</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete this medical record?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(record.id)} className="bg-red-600">
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

                {records.links && records.links.length > 1 && <Pagination links={records.links} />}
            </div>
        </AppLayout>
    );
}
