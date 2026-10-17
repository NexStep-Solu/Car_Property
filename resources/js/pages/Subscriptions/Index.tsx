import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';

interface Subscription {
    id: number;
    status: string;
    starts_at: string | null;
    ends_at: string | null;
    listings_used: number;
    active_listing_limit_snapshot: number;
    price_amount_snapshot: number;
    currency_snapshot: string;
    showroom?: { id: number; business_name: string } | null;
    package?: { id: number; name: string } | null;
}

interface PaginatedSubscriptions {
    data: Subscription[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    subscriptions: PaginatedSubscriptions;
    filters: { status?: string };
    packages: Array<{ id: number; name: string; price_amount: number; currency: string }>;
    showrooms: Array<{ id: number; business_name: string }>;
    canPurchase: boolean;
}

export default function SubscriptionsIndex({ subscriptions, filters, packages, showrooms, canPurchase }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Subscriptions', href: '/subscriptions' }];

    const [isBuyOpen, setIsBuyOpen] = useState(false);
    const buyForm = useForm({ showroom_id: '', package_id: '' });

    const submitBuy = (e: React.FormEvent) => {
        e.preventDefault();
        buyForm.post(route('subscriptions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsBuyOpen(false);
                buyForm.reset();
                toast.success('Subscription created. Record a payment to activate.');
            },
            onError: () => toast.error('Could not create subscription.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscriptions" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="my-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Subscriptions</h1>
                    {canPurchase && (
                        <Dialog open={isBuyOpen} onOpenChange={setIsBuyOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" /> Buy Package
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Buy Package</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submitBuy} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Showroom *</Label>
                                        <Select value={buyForm.data.showroom_id || undefined} onValueChange={(v) => buyForm.setData('showroom_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select showroom" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {showrooms.map((s) => (
                                                    <SelectItem key={s.id} value={String(s.id)}>
                                                        {s.business_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={buyForm.errors.showroom_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Package *</Label>
                                        <Select value={buyForm.data.package_id || undefined} onValueChange={(v) => buyForm.setData('package_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select package" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {packages.map((p) => (
                                                    <SelectItem key={p.id} value={String(p.id)}>
                                                        {p.name} — {Number(p.price_amount).toLocaleString()} {p.currency}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={buyForm.errors.package_id} />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={buyForm.processing}>
                                            Purchase
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Subscriptions {filters.status ? `— ${capitalizeFirst(filters.status.replace(/_/g, ' '))}` : ''}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Showroom</TableHead>
                                    <TableHead>Package</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Listings</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subscriptions.data.map((sub: Subscription) => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="font-medium">{sub.showroom?.business_name || '-'}</TableCell>
                                        <TableCell>{sub.package?.name || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{capitalizeFirst(sub.status.replace(/_/g, ' '))}</Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {sub.starts_at ? new Date(sub.starts_at).toLocaleDateString() : '-'} →{' '}
                                            {sub.ends_at ? new Date(sub.ends_at).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {sub.listings_used}/{sub.active_listing_limit_snapshot === 0 ? '∞' : sub.active_listing_limit_snapshot}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={route('subscriptions.show', sub.id)}>
                                                <Button variant="outline" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {subscriptions.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-muted-foreground py-6 text-center text-sm">
                                            No subscriptions yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {subscriptions.links && subscriptions.links.length > 1 && <Pagination links={subscriptions.links} />}
            </div>
        </AppLayout>
    );
}
