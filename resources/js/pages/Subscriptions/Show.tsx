import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Payment {
    id: number;
    provider: string;
    amount: number;
    currency: string;
    status: string;
    paid_at: string | null;
    payer?: { id: number; name: string } | null;
}

interface Subscription {
    id: number;
    uuid: string;
    status: string;
    starts_at: string | null;
    ends_at: string | null;
    active_listing_limit_snapshot: number;
    price_amount_snapshot: number;
    currency_snapshot: string;
    listings_used: number;
    showroom: { id: number; business_name: string; slug: string };
    package?: { id: number; name: string; duration_days: number } | null;
    payments: Payment[];
}

interface Props {
    subscription: Subscription;
    canPay: boolean;
    canConfirm: boolean;
    canCancel: boolean;
}

export default function SubscriptionsShow({ subscription, canPay, canConfirm, canCancel }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Subscriptions', href: '/subscriptions' },
        { title: `#${subscription.id}`, href: `/subscriptions/${subscription.id}` },
    ];

    const [isPayOpen, setIsPayOpen] = useState(false);
    const payForm = useForm({ subscription_id: subscription.id, provider: 'manual', amount: String(subscription.price_amount_snapshot), currency: subscription.currency_snapshot });

    const submitPay = (e: React.FormEvent) => {
        e.preventDefault();
        payForm.post(route('payments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsPayOpen(false);
                toast.success('Payment recorded. Awaiting confirmation.');
            },
            onError: () => toast.error('Could not record payment.'),
        });
    };

    const cancelSub = () => {
        if (!confirm(`Cancel subscription #${subscription.id}?`)) return;
        router.post(route('subscriptions.cancel', subscription.id), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Subscription cancelled.'),
            onError: () => toast.error('Could not cancel subscription.'),
        });
    };

    const isOpen = ['pending_payment', 'active'].includes(subscription.status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Subscription #${subscription.id}`} />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {subscription.showroom.business_name} — {subscription.package?.name || 'Package'}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {Number(subscription.price_amount_snapshot).toLocaleString()} {subscription.currency_snapshot} ·{' '}
                            {subscription.listings_used}/{subscription.active_listing_limit_snapshot === 0 ? '∞' : subscription.active_listing_limit_snapshot} listings used
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {canPay && isOpen && (
                            <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" /> Record Payment
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Record Payment</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={submitPay} className="space-y-4">
                                        <PayFields payForm={payForm} />
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={payForm.processing}>
                                                Record
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                        {canCancel && isOpen && (
                            <Button variant="outline" onClick={cancelSub}>
                                Cancel
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => router.visit(route('subscriptions.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                        <div>
                            <p className="text-muted-foreground">Status</p>
                            <Badge variant="outline">{capitalizeFirst(subscription.status.replace(/_/g, ' '))}</Badge>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Period</p>
                            <p className="font-medium">
                                {subscription.starts_at ? new Date(subscription.starts_at).toLocaleDateString() : '-'} →{' '}
                                {subscription.ends_at ? new Date(subscription.ends_at).toLocaleDateString() : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">UUID</p>
                            <p className="font-mono text-xs">{subscription.uuid}</p>
                        </div>
                    </CardContent>
                </Card>

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
                                {subscription.payments.map((payment: Payment) => (
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
                                {subscription.payments.length === 0 && (
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

                {canConfirm && (
                    <p className="text-muted-foreground text-xs">Confirm or refund payments from the payment detail page.</p>
                )}
            </div>
        </AppLayout>
    );
}

function PayFields({ payForm }: { payForm: { data: { provider: string; amount: string; currency: string }; setData: (key: string, value: string) => void; errors: Record<string, string> } }) {
    return (
        <>
            <div className="grid gap-2">
                <Label>Provider *</Label>
                <Select value={payForm.data.provider} onValueChange={(v) => payForm.setData('provider', v)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {['manual', 'kbzpay', 'wavepay', 'cbpay'].map((p) => (
                            <SelectItem key={p} value={p}>
                                {capitalizeFirst(p)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={payForm.errors.provider} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Amount *</Label>
                    <Input type="number" min="0" value={payForm.data.amount} onChange={(e) => payForm.setData('amount', e.target.value)} />
                    <InputError message={payForm.errors.amount} />
                </div>
                <div className="grid gap-2">
                    <Label>Currency *</Label>
                    <Input value={payForm.data.currency} onChange={(e) => payForm.setData('currency', e.target.value.toUpperCase())} maxLength={3} />
                    <InputError message={payForm.errors.currency} />
                </div>
            </div>
        </>
    );
}
