import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Billing {
    id: number;
    invoice_number: string;
    patient: { name: string };
    billing_date: string;
    total: number;
    amount_paid: number;
    status: string;
    payment_method: string | null;
    notes: string | null;
}

interface Props {
    billing: Billing;
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function BillingsShow({ billing }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Billings', href: '/billings' },
        { title: billing.invoice_number, href: `/billings/${billing.id}` },
    ];

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
            <Head title={`Billing: ${billing.invoice_number}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{billing.invoice_number}</h1>
                        <p className="text-muted-foreground text-sm">Billing Details</p>
                    </div>
                    <div className="flex gap-2">
                        {billing.status !== 'paid' && (
                            <Link href={route('billings.edit', billing.id)}>
                                <Button variant="outline" className="gap-2">
                                    <Pencil className="h-4 w-4" /> Edit
                                </Button>
                            </Link>
                        )}
                        <Button variant="secondary" onClick={() => router.visit(route('billings.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Badge className={getStatusColor(billing.status)}>{billing.status}</Badge>

                <Card>
                    <CardHeader>
                        <CardTitle>Billing Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="Invoice Number" value={billing.invoice_number} />
                        <Info label="Patient" value={billing.patient?.name} />
                        <Info label="Billing Date" value={billing.billing_date} />
                        <Info label="Payment Method" value={billing.payment_method} />
                        <Info label="Total Amount" value={formatCurrency(billing.total)} />
                        <Info label="Amount Paid" value={formatCurrency(billing.amount_paid)} />
                        <Info label="Balance" value={formatCurrency(billing.total - billing.amount_paid)} />
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground text-sm">Notes</p>
                            <p className="font-medium">{billing.notes || '-'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
