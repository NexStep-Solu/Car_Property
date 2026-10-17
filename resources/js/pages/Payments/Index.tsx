import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';

interface Payment {
    id: number;
    provider: string;
    amount: number;
    currency: string;
    status: string;
    paid_at: string | null;
    payer?: { id: number; name: string } | null;
    subscription?: { id: number; showroom?: { business_name: string } | null } | null;
}

interface PaginatedPayments {
    data: Payment[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    payments: PaginatedPayments;
    filters: { status?: string };
    statuses: string[];
}

export default function PaymentsIndex({ payments }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Payments', href: '/payments' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Payments</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payer</TableHead>
                                    <TableHead>Paid At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.data.map((payment: Payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">{payment.provider}</TableCell>
                                        <TableCell>
                                            {Number(payment.amount).toLocaleString()} {payment.currency}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{capitalizeFirst(payment.status.replace(/_/g, ' '))}</Badge>
                                        </TableCell>
                                        <TableCell>{payment.payer?.name || '-'}</TableCell>
                                        <TableCell>{payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={route('payments.show', payment.id)}>
                                                <Button variant="outline" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {payments.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-muted-foreground py-6 text-center text-sm">
                                            No payments yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {payments.links && payments.links.length > 1 && <Pagination links={payments.links} />}
            </div>
        </AppLayout>
    );
}
