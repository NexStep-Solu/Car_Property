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

interface Insurance {
    id: number;
    patient_id: number;
    patient: { name: string };
    insurance_provider: string;
    policy_number: string;
    group_number?: string;
    plan_name?: string;
    coverage_start_date: string;
    coverage_end_date: string;
    coverage_percentage: number;
    max_coverage_amount: number;
    status: string;
}

interface Props {
    insurances: {
        data: Insurance[];
        links: any[];
    };
}

export default function InsurancesIndex({ insurances }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Insurances', href: '/insurances' }];

    const [online, setOnline] = useState(navigator.onLine);
    useEffect(() => {
        window.addEventListener('online', () => setOnline(true));
        window.addEventListener('offline', () => setOnline(false));
    }, []);

    if (!online) return <OfflinePage />;

    const handleDelete = (id: number) => {
        router.delete(`/insurances/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Insurance deleted successfully'),
            onError: () => toast.error('Failed to delete insurance'),
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Insurances" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Insurances</h1>
                    <Link href={route('insurances.create')}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Insurance
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Insurances</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Policy #</TableHead>
                                    <TableHead>Coverage</TableHead>
                                    <TableHead>Valid Until</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {insurances.data.map((insurance) => (
                                    <TableRow key={insurance.id}>
                                        <TableCell className="font-medium">{insurance.patient?.name}</TableCell>
                                        <TableCell>{insurance.insurance_provider}</TableCell>
                                        <TableCell>{insurance.policy_number}</TableCell>
                                        <TableCell>{insurance.coverage_percentage}%</TableCell>
                                        <TableCell>{insurance.coverage_end_date}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs ${
                                                    insurance.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : insurance.status === 'expired'
                                                          ? 'bg-red-100 text-red-800'
                                                          : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {insurance.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('insurances.show', insurance.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={route('insurances.edit', insurance.id)}>
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
                                                            <AlertDialogTitle>Delete Insurance</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete this insurance?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(insurance.id)} className="bg-red-600">
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

                {insurances.links && insurances.links.length > 1 && <Pagination links={insurances.links} />}
            </div>
        </AppLayout>
    );
}
