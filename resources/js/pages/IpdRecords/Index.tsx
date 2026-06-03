import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, LogOut, Plus, Trash2 } from 'lucide-react';
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

interface IpdRecord {
    id: number;
    patient_id: number;
    patient: { name: string };
    bed_id: number;
    bed?: { bed_number: string };
    admission_date: string;
    discharge_date?: string;
    admission_reason: string;
    diagnosis?: string;
    status: string;
    attending_doctor_id: number;
    attending_doctor?: { name: string };
    total_charges: number;
}

interface Props {
    records: {
        data: IpdRecord[];
        links: any[];
    };
}

export default function IpdRecordsIndex({ records }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'IPD Records', href: '/ipd-records' }];

    const [online, setOnline] = useState(navigator.onLine);
    useEffect(() => {
        window.addEventListener('online', () => setOnline(true));
        window.addEventListener('offline', () => setOnline(false));
    }, []);

    if (!online) return <OfflinePage />;

    const handleDelete = (id: number) => {
        router.delete(`/ipd-records/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('IPD record deleted successfully'),
            onError: () => toast.error('Failed to delete IPD record'),
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="IPD Records" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">IPD Records</h1>
                    <Link href={route('ipd-records.create')}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Admit Patient
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All IPD Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Bed</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Admission</TableHead>
                                    <TableHead>Discharge</TableHead>
                                    <TableHead>Charges</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.data.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">{record.patient?.name}</TableCell>
                                        <TableCell>{record.bed?.bed_number || 'N/A'}</TableCell>
                                        <TableCell>{record.attending_doctor?.name || 'N/A'}</TableCell>
                                        <TableCell>{new Date(record.admission_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{record.discharge_date ? new Date(record.discharge_date).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell>{formatCurrency(record.total_charges)}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs ${
                                                    record.status === 'admitted' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                {record.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('ipd-records.show', record.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                {record.status === 'admitted' && (
                                                    <Link href={route('ipd-records.edit', record.id)}>
                                                        <Button variant="outline" size="icon">
                                                            <LogOut className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="hover:bg-red-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete IPD Record</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete this IPD record?
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
