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

interface LabTest {
    id: number;
    patient_id: number;
    patient: { name: string };
    doctor_id: number;
    doctor?: { name: string };
    test_name: string;
    test_code?: string;
    category?: string;
    ordered_date: string;
    result_date?: string;
    result?: string;
    normal_range?: string;
    unit?: string;
    status: string;
}

interface Props {
    labTests: {
        data: LabTest[];
        links: any[];
    };
}

export default function LabTestsIndex({ labTests }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Lab Tests', href: '/lab-tests' }];

    const [online, setOnline] = useState(navigator.onLine);
    useEffect(() => {
        window.addEventListener('online', () => setOnline(true));
        window.addEventListener('offline', () => setOnline(false));
    }, []);

    if (!online) return <OfflinePage />;

    const handleDelete = (id: number) => {
        router.delete(`/lab-tests/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Lab test deleted successfully'),
            onError: () => toast.error('Failed to delete lab test'),
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            ordered: 'bg-blue-100 text-blue-800',
            processing: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Tests" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Lab Tests</h1>
                    <Link href={route('lab-tests.create')}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Order Test
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Lab Tests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Test Name</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Ordered By</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Ordered Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {labTests.data.map((test) => (
                                    <TableRow key={test.id}>
                                        <TableCell className="font-medium">{test.test_name}</TableCell>
                                        <TableCell>{test.patient?.name}</TableCell>
                                        <TableCell>{test.doctor?.name || 'N/A'}</TableCell>
                                        <TableCell>{test.category || '-'}</TableCell>
                                        <TableCell>{test.ordered_date}</TableCell>
                                        <TableCell>
                                            <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(test.status)}`}>{test.status}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('lab-tests.show', test.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={route('lab-tests.edit', test.id)}>
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
                                                            <AlertDialogTitle>Delete Lab Test</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete this lab test?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(test.id)} className="bg-red-600">
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

                {labTests.links && labTests.links.length > 1 && <Pagination links={labTests.links} />}
            </div>
        </AppLayout>
    );
}
