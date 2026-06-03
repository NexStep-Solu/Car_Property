import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Eye, Pencil } from 'lucide-react';

interface Billing {
    id: number;
    invoice_number: string;
    patient_id: number;
    patient: { name: string };
    billing_date: string;
    total: number;
    amount_paid: number;
    status: string;
    payment_method?: string;
}

interface Props {
    billings: {
        data: Billing[];
        links: any[];
    };
}

export default function BillingsIndex({ billings }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Billings', href: '/billings' }];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            partial: 'bg-blue-100 text-blue-800',
            paid: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billings" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Billings</h1>
                    <Link href={route('billings.create')}>
                        <Button className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" /> Create Billing
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Billings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Paid</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {billings.data.map((billing) => (
                                    <TableRow key={billing.id}>
                                        <TableCell className="font-medium">{billing.invoice_number}</TableCell>
                                        <TableCell>{billing.patient?.name}</TableCell>
                                        <TableCell>{billing.billing_date}</TableCell>
                                        <TableCell>{formatCurrency(billing.total)}</TableCell>
                                        <TableCell>{formatCurrency(billing.amount_paid)}</TableCell>
                                        <TableCell>
                                            <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(billing.status)}`}>
                                                {billing.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('billings.show', billing.id)}>
                                                    <Button variant="outline" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                {billing.status !== 'paid' && (
                                                    <Link href={route('billings.edit', billing.id)}>
                                                        <Button variant="outline" size="icon">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {billings.links && billings.links.length > 1 && <Pagination links={billings.links} />}
            </div>
        </AppLayout>
    );
}
