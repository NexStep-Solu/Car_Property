import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface Payment {
    id: number;
    provider: string;
    provider_reference: string | null;
    amount: number;
    currency: string;
    status: string;
    paid_at: string | null;
    idempotency_key: string | null;
    subscription?: { id: number; showroom?: { business_name: string } | null } | null;
    payer?: { id: number; name: string; email: string } | null;
    confirmer?: { id: number; name: string } | null;
}

interface Props {
    payment: Payment;
    canConfirm: boolean;
}

export default function PaymentsShow({ payment, canConfirm }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Payments', href: '/payments' },
        { title: `#${payment.id}`, href: `/payments/${payment.id}` },
    ];

    const confirmForm = useForm({ type: 'full' });

    const confirmPayment = () => {
        router.post(route('payments.confirm', payment.id), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Payment confirmed and subscription activated.'),
            onError: () => toast.error('Could not confirm payment.'),
        });
    };

    const refundPayment = (e: React.FormEvent) => {
        e.preventDefault();
        confirmForm.post(route('payments.refund', payment.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Payment refunded.'),
            onError: () => toast.error('Could not refund payment.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Payment #${payment.id}`} />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {Number(payment.amount).toLocaleString()} {payment.currency} via {payment.provider}
                        </h1>
                        <p className="text-muted-foreground font-mono text-xs">{payment.idempotency_key}</p>
                    </div>
                    <div className="flex gap-2">
                        {canConfirm && payment.status === 'pending' && <Button onClick={confirmPayment}>Confirm Payment</Button>}
                        <Button variant="secondary" onClick={() => router.visit(route('payments.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                            <p className="text-muted-foreground">Status</p>
                            <Badge variant="outline">{capitalizeFirst(payment.status.replace(/_/g, ' '))}</Badge>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Payer</p>
                            <p className="font-medium">
                                {payment.payer?.name} ({payment.payer?.email})
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Showroom</p>
                            <p className="font-medium">{payment.subscription?.showroom?.business_name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Paid at</p>
                            <p className="font-medium">{payment.paid_at ? new Date(payment.paid_at).toLocaleString() : '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Confirmed by</p>
                            <p className="font-medium">{payment.confirmer?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Provider reference</p>
                            <p className="font-medium">{payment.provider_reference || '-'}</p>
                        </div>
                    </CardContent>
                </Card>

                {canConfirm && payment.status === 'succeeded' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Refund</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={refundPayment} className="flex flex-wrap items-end gap-4">
                                <div className="grid gap-2">
                                    <Label>Type</Label>
                                    <Select value={confirmForm.data.type} onValueChange={(v) => confirmForm.setData('type', v)}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="full">Full refund</SelectItem>
                                            <SelectItem value="partial">Partial refund</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={confirmForm.errors.type} />
                                </div>
                                <Button type="submit" variant="destructive" disabled={confirmForm.processing}>
                                    Refund Payment
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="text-sm">
                    <Link href={route('subscriptions.show', payment.subscription?.id)} className="text-primary hover:underline">
                        ← Back to subscription
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
